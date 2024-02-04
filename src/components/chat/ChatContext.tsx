import { trpc } from '@/app/_trpc/client'
import { INFINITE_QUERY_LIMIT } from '@/config/infinite-query'
import { useMutation } from '@tanstack/react-query'
import { ReactNode, createContext, useRef, useState } from 'react'
import { useToast } from '../ui/use-toast'

type StreamResponse = {
  addMessage: () => void
  message: string
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  isLoading: boolean
}

export const ChatContext = createContext<StreamResponse>({
  addMessage: () => {},
  message: '',
  handleInputChange: () => {},
  isLoading: false,
})

interface Props {
  fileId: string
  children: ReactNode
}

export const ChatContextProvider = ({ fileId, children }: Props) => {
  const [message, setMessage] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const utils = trpc.useContext()

  const { toast } = useToast()

  const backupMessage = useRef('')

  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      const response = await fetch('/api/message', {
        method: 'POST',
        body: JSON.stringify({
          fileId,
          message,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      return response.body
    },
    onMutate: async ({ message }) => {
      backupMessage.current = message
      setMessage('')

      // cancel outbound calls to prevent overwriting optimistic update
      await utils.getFileMessages.cancel()

      // snapshot previous messages
      const previousMessages = utils.getFileMessages.getInfiniteData()

      // optimistic insert new message
      utils.getFileMessages.setInfiniteData(
        { fileId, limit: INFINITE_QUERY_LIMIT },
        // updater function
        (oldMessagePages) => {
          if (!oldMessagePages) {
            return {
              pages: [],
              pageParams: [],
            }
          }

          let newPages = [...oldMessagePages.pages]
          let latestPage = newPages[0]!

          // insert new message to latest page
          latestPage.messages = [
            {
              createdAt: new Date().toISOString(),
              id: crypto.randomUUID(),
              text: message,
              isUserMessage: true,
            },
            ...latestPage.messages,
          ]

          // update pages with new message inserted
          newPages[0] = latestPage

          return {
            ...oldMessagePages,
            pages: newPages,
          }
        },
      )
      // trigger AI thinking loading spinner
      setIsLoading(true)

      return {
        previousMessages: previousMessages?.pages.flatMap(
          (page) => page.messages,
        ),
      }
    },
    onError: (_, __, context) => {
      // move optmistic update into text input
      setMessage(backupMessage.current)
      utils.getFileMessages.setData(
        { fileId },
        { messages: context?.previousMessages ?? [] },
      )
    },
    onSettled: async () => {
      setIsLoading(false)
      await utils.getFileMessages.invalidate({ fileId })
    },
    onSuccess: async (tokenStream) => {
      setIsLoading(false)

      if (!tokenStream) {
        return toast({
          title: 'There was a problem sending this message',
          description: 'Please refresh this page and try again',
          variant: 'destructive',
        })
      }

      const streamReader = tokenStream.getReader()
      const textDecoder = new TextDecoder()
      let done = false

      let accumulatedStreamResponse = ''

      while (!done) {
        // exit done loop if stream is done
        const { value, done: doneReading } = await streamReader.read()
        done = doneReading

        // accumulate chunks
        const streamChunkValue = textDecoder.decode(value)
        accumulatedStreamResponse += streamChunkValue

        // append chunks to message
        utils.getFileMessages.setInfiniteData(
          { fileId, limit: INFINITE_QUERY_LIMIT },
          (oldMessagePages) => {
            if (!oldMessagePages) return { pages: [], pageParams: [] }

            // check if ai-response to the message already exists
            let isAiResponseCreated = oldMessagePages.pages.some((page) =>
              page.messages.some((message) => message.id === 'ai-response'),
            )

            let updatedPages = oldMessagePages.pages.map((page) => {
              // modify first/latest page
              if (page === oldMessagePages.pages[0]) {
                let updatedMessages

                // create ai-response message
                if (!isAiResponseCreated) {
                  updatedMessages = [
                    {
                      createdAt: new Date().toISOString(),
                      id: 'ai-response',
                      text: accumulatedStreamResponse,
                      isUserMessage: false,
                    },
                    ...page.messages,
                  ]
                } else {
                  // update existing ai-response message
                  updatedMessages = page.messages.map((message) => {
                    if (message.id === 'ai-response') {
                      return {
                        ...message,
                        text: accumulatedStreamResponse,
                      }
                    }
                    return message
                  })
                }

                // return new page with updated messages
                return {
                  ...page,
                  messages: updatedMessages,
                }
              }

              // return old page
              return page
            })

            return { ...oldMessagePages, pages: updatedPages }
          },
        )
      }
    },
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
  }

  const addMessage = () => sendMessage({ message })

  return (
    <ChatContext.Provider
      value={{
        addMessage,
        message,
        handleInputChange,
        isLoading,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}
