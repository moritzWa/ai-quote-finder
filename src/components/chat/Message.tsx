import { trpc } from '@/app/_trpc/client'
import { cn } from '@/lib/utils'
import { ExtendedMessage } from '@/types/message'
import { format } from 'date-fns'
import { forwardRef, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import ReactMarkdown from 'react-markdown'
import { Icons } from '../Icons'

interface MessageProps {
  message: ExtendedMessage
  isNextMessageSamePerson: boolean
}

// need to wrap this in forwardRef to pass down ref
const Message = forwardRef<HTMLDivElement, MessageProps>(
  ({ message, isNextMessageSamePerson }, ref) => {
    const [currentlyDeletingMessage, setCurrentlyDeletingMessage] = useState<
      string | null
    >(null)

    console.log('rendered message in message.tsx', message)
    const utils = trpc.useContext()

    const { mutate: deleteFile, isLoading } = trpc.deleteMessage.useMutation({
      onSuccess: () => {
        utils.getFileMessages.invalidate()
      },
      onMutate({ id }) {
        setCurrentlyDeletingMessage(id)
      },
      onSettled() {
        setCurrentlyDeletingMessage(null)
      },
    })

    const handleDelete = () => {
      deleteFile({ id: message.id })
    }

    if (isLoading || currentlyDeletingMessage === message.id) {
      return <Skeleton className="h-16" />
    } else
      return (
        <div
          ref={ref}
          className={cn('flex items-end', {
            'justify-end': message.isUserMessage,
          })}
        >
          <div
            className={cn(
              'relative flex h-6 w-6 aspect-square items-center justify-center',
              {
                'order-2 bg-blue-600 rounded-sm': message.isUserMessage,
                'order-1 bg-zinc-800 rounded-sm': !message.isUserMessage,
                invisible: isNextMessageSamePerson,
              },
            )}
          >
            {message.isUserMessage ? (
              <Icons.user className="fill-zinc-200 text-zinc-200 h-3/4 w-3/4" />
            ) : (
              <Icons.logo className="fill-zinc-300 h-3/4 w-3/4" />
            )}
          </div>

          <div
            className={cn('flex flex-col space-y-2 text-base max-w-md mx-2', {
              'order-1 items-end': message.isUserMessage,
              'order-2 items-start': !message.isUserMessage,
            })}
          >
            <div
              className={cn('px-4 pl-8 py-2 rounded-lg inline-block', {
                'bg-blue-600 text-white': message.isUserMessage,
                'bg-gray-200 text-gray-900': !message.isUserMessage,
                'rounded-br-none':
                  !isNextMessageSamePerson && message.isUserMessage,
                'rounded-bl-none':
                  !isNextMessageSamePerson && !message.isUserMessage,
              })}
            >
              {/* {console.log('message.text', message.text)} */}
              {typeof message.text === 'string' ? (
                <ReactMarkdown
                  className={cn('prose', {
                    'text-zinc-50': message.isUserMessage,
                  })}
                  components={{
                    ul: ({ node, ...props }) => (
                      <ul style={{ listStyleType: 'disc' }} {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ul style={{ listStyleType: 'decimal' }} {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="py-2" {...props} />
                    ),
                  }}
                >
                  {message.text}
                </ReactMarkdown>
              ) : (
                message.text
              )}
              <div
                className={cn(
                  'text-xs select-none mt-2 w-full flex justify-end gap-3',
                  {
                    'text-zinc-500': !message.isUserMessage,
                    'text-blue-300': message.isUserMessage,
                  },
                )}
              >
                {message.id !== 'loading-message' && (
                  <div
                    className="hover:text-rose-400 cursor-pointer"
                    onClick={() => handleDelete()}
                  >
                    Delete
                  </div>
                )}
                {message.id !== 'loading-message'
                  ? format(new Date(message.createdAt), 'HH:mm')
                  : null}
              </div>
            </div>
          </div>
        </div>
      )
  },
)

Message.displayName = 'Message'

export default Message
