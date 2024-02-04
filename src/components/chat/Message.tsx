import { trpc } from '@/app/_trpc/client'
import { cn } from '@/lib/utils'
import { ExtendedMessage } from '@/types/message'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { forwardRef, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { Icons } from '../Icons'
import { useToast } from '../ui/use-toast'
import { LoadingMessage } from './Messages'

interface MessageProps {
  message: ExtendedMessage | LoadingMessage
  isNextMessageSamePerson: boolean
}

// need to wrap this in forwardRef to pass down ref
const Message = forwardRef<HTMLDivElement, MessageProps>(
  ({ message, isNextMessageSamePerson }, ref) => {
    const { toast } = useToast()
    const router = useRouter()

    const [currentlyDeletingMessage, setCurrentlyDeletingMessage] = useState<
      string | null
    >(null)

    // console.log('rendered message in message.tsx', message)
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

    type listItemType = string[] | ''

    // Split the message into list items
    const listItems: listItemType =
      typeof message.text === 'string'
        ? message.text.split(/^\d+\./m).filter((item) => item.trim() !== '')
        : ''

    const listItemElements =
      listItems &&
      listItems.map((item, index) => {
        // Extract the quote and page number using regex
        const match = item.match(/"(.+)" \(Page: (\d+)\)/)

        // If this is the first item, return it as a paragraph
        if (index === 0) {
          return <p key={index}>{item}</p>
        }

        if (match) {
          const quote = match[1]
          const pageNumber = match[2]

          // Return a JSX element with the quote and a link to the page
          return (
            <li className="py-2 ml-8" key={index}>
              {quote}{' '}
              <a
                className="text-gray-500 hover:text-blue-600"
                href={`?page=${pageNumber}`}
                onClick={(e) => {
                  e.preventDefault()
                  router.replace(
                    `${window.location.pathname}?page=${pageNumber}`,
                  )
                }}
              >
                (Page: {pageNumber})
              </a>
              <span
                className="pl-2 text-gray-500 hover:text-green-500 cursor-pointer"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${quote} (Page: ${pageNumber})`,
                  )
                  return toast({
                    title: 'Copied Quote to Clipboard',
                    variant: 'default',
                  })
                }}
              >
                Copy
              </span>
            </li>
          )
        } else {
          // If the regex didn't match, just return the item as is
          return <li key={index}>{item}</li>
        }
      })

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
              className={cn('px-2 py-2 rounded-lg inline-block', {
                'bg-blue-600 text-white': message.isUserMessage,
                'bg-gray-200 text-gray-900': !message.isUserMessage,
                'rounded-br-none':
                  !isNextMessageSamePerson && message.isUserMessage,
                'rounded-bl-none':
                  !isNextMessageSamePerson && !message.isUserMessage,
                // 'pl-8': !message.isUserMessage,
              })}
            >
              {/* {console.log('message.text', message.text)} */}

              {message.isUserMessage ? (
                <p>{message.text}</p>
              ) : (
                <ul style={{ listStyleType: 'disc' }}>{listItemElements}</ul>
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
