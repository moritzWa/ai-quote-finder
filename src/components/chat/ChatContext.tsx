import { trpc } from '@/app/_trpc/client'
import { INFINITE_QUERY_LIMIT } from '@/config/infinite-query'
import { freePlan } from '@/config/stripe'
import { useMutation } from '@tanstack/react-query'
import { ReactNode, createContext, useRef, useState } from 'react'
import { useToast } from '../ui/use-toast'

type StreamResponse = {
  addMessage: () => void
  message: string
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  isLoading: boolean
  isLimitReachedError: null | string
  quoteMode: boolean
  setQuoteMode: (quoteMode: boolean) => void
}

export const ChatContext = createContext<StreamResponse>({
  addMessage: () => {},
  message: '',
  handleInputChange: () => {},
  isLoading: false,
  isLimitReachedError: null,
  quoteMode: true,
  setQuoteMode: () => {},
})

interface Props {
  fileId: string
  fileTypeIsEpub: boolean
  children: ReactNode
}

export const ChatContextProvider = ({
  fileId,
  fileTypeIsEpub,
  children,
}: Props) => {
  const [message, setMessage] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isLimitReachedError, setIsLimitReached] = useState<null | string>(null)
  const [quoteMode, setQuoteMode] = useState(true)

  const utils = trpc.useUtils()

  const { toast } = useToast()

  const backupMessage = useRef('')

  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      const response = await fetch('/api/message', {
        method: 'POST',
        body: JSON.stringify({
          fileId,
          message,
          quoteMode,
        }),
      })

      if (!response.ok) {
        if (response.status === 403) {
          setIsLimitReached(await response.text())
          throw new Error(await response.text())
        }
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

          // insert new message from user to latest page
          latestPage.messages = [
            {
              createdAt: new Date().toISOString(),
              id: crypto.randomUUID(),
              text: message,
              isUserMessage: true,
              quoteMode: quoteMode,
              isFromEpubWithHref: false,
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
    onError: (error: Error, __, context) => {
      // move optmistic update into text input
      setMessage(backupMessage.current)
      utils.getFileMessages.setData(
        { fileId },
        { messages: context?.previousMessages ?? [] },
      )

      if (error.message.startsWith('Free plan message limit reached')) {
        toast({
          title: 'Free plan message limit reached',
          description: (
            <>
              {error.message} You can only process up to {freePlan.maxMesages}{' '}
              and {freePlan.maxMessagesPerDay} messages per day. Upgrade{' '}
              <a className="underline" href="/pricing">
                here
              </a>
              .
            </>
          ),
          variant: 'default',
          durationSeconds: 15,
        })
      }
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
                      quoteMode: quoteMode,
                      isFromEpubWithHref: fileTypeIsEpub, // TODO: get correct value somehow
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
        isLimitReachedError,
        quoteMode,
        setQuoteMode,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}
