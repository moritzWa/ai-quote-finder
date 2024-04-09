import { trpc } from '@/app/_trpc/client'
import { cn } from '@/lib/utils'
import { ExtendedMessage } from '@/types/message'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'
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

    console.log('message', message)

    // Split the message into list items
    const listItems: listItemType =
      typeof message.text === 'string'
        ? message.text.split(/\n- /).filter((item) => item.trim() !== '')
        : ''

    const listItemElements =
      listItems &&
      listItems.map((item, index) => {
        // Extract the quote and page number using regex

        const partsedPartsOfQuote = message.isFromEpubWithHref
          ? item.match(/^(.+) \(Href: ([\w\.\/]+)\)/)
          : item.match(/^(.+) \(Page: (\d+)\)/)

        // general chatbot text to prefece the list of quote
        if (index === 0 && !partsedPartsOfQuote) {
          return <p key={index}>test: {item}</p>
        }

        if (partsedPartsOfQuote) {
          const quote = partsedPartsOfQuote[1]
          const locationIdentifier = partsedPartsOfQuote[2]

          // console.log('quote', quote, 'pageNumber', pageNumber)

          // Return a JSX element with the quote and a link to the page

          console.log('quote:', quote)

          return (
            <li className="pb-2" key={index}>
              {quote.startsWith('- ') ? quote.slice(2) : quote}
              <div className="pt-2 text-sm flex justify-end">
                {message.isFromEpubWithHref ? (
                  <a
                    className="text-gray-500 hover:text-blue-600 cursor-pointer"
                    href={locationIdentifier}
                    onClick={(e) => {
                      e.preventDefault()
                      router.replace(
                        `${window.location.pathname}?page=${locationIdentifier}`,
                      )
                    }}
                  >
                    Go to section
                  </a>
                ) : (
                  <a
                    className="text-gray-500 hover:text-blue-600 cursor-pointer"
                    href={`?page=${locationIdentifier}`}
                    onClick={(e) => {
                      e.preventDefault()
                      router.replace(
                        `${window.location.pathname}?page=${locationIdentifier}`,
                      )
                    }}
                  >
                    Page: {locationIdentifier}
                  </a>
                )}
                <span
                  className="pl-4 text-gray-500 hover:text-green-500 cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${quote} (Page: ${locationIdentifier})`,
                    )
                    return toast({
                      title: 'Copied Quote to Clipboard',
                      variant: 'default',
                    })
                  }}
                >
                  Copy
                </span>
              </div>
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

              {message.id === 'loading-message' ? (
                <div className="flex p-1 justify-center items-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : message.isUserMessage || !message.quoteMode ? (
                <p>{message.text}</p>
              ) : (
                <div className="ml-8">
                  <ul style={{ listStyleType: 'disc' }}>{listItemElements}</ul>
                </div>
              )}
              <div
                className={cn(
                  'text-xs select-none w-full flex justify-end gap-3',
                  {
                    'mt-1': message.id !== 'loading-message',
                  },
                  {
                    'text-zinc-500': !message.isUserMessage,
                    'text-blue-300': message.isUserMessage,
                  },
                )}
              >
                {!message.isUserMessage && message.id !== 'loading-message' && (
                  <div
                    className="hover:text-green-400 cursor-pointer"
                    onClick={() => {
                      if (typeof message.text === 'string') {
                        navigator.clipboard.writeText(message.text)
                        return toast({
                          title: 'Copied to Clipboard',
                          variant: 'default',
                        })
                      }
                    }}
                  >
                    Copy All
                  </div>
                )}
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
