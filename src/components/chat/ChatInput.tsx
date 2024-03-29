import { freePlan } from '@/config/stripe'
import { MessageCircleIcon, QuoteIcon, Send } from 'lucide-react'
import { useContext, useRef } from 'react'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { Toggle } from '../ui/toggle'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
import { ChatContext } from './ChatContext'

interface ChatInputProps {
  isDisabled?: boolean
}

const ChatInput = ({ isDisabled }: ChatInputProps) => {
  const {
    addMessage,
    handleInputChange,
    isLoading,
    isLimitReachedError,
    message,
    quoteMode,
    setQuoteMode,
  } = useContext(ChatContext)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  return (
    <div className="absolute bottom-0 left-0 w-full">
      <div className="mx-2 flex flex-row gap-3 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
        <div className="relative flex h-full flex-1 items-stretch md:flex-col">
          <div className="relative flex flex-col w-full flex-grow p-4">
            {isLimitReachedError && (
              <div
                className="bg-purple-100 mb-6 flex flex-col border border-purple-400 text-purple-800 px-4 py-3 rounded-lg relative"
                role="alert"
              >
                <strong className="font-bold">Message Limit Reached</strong>
                <span className="block sm:inline">
                  {isLimitReachedError} You can only process up to{' '}
                  {freePlan.maxMesages} in total and{' '}
                  <b>{freePlan.maxMessagesPerDay} messages per day</b>. Upgrade{' '}
                  <a className="underline" href="/pricing">
                    here
                  </a>
                  .
                </span>
              </div>
            )}

            <div className="relative">
              <Textarea
                rows={1}
                ref={textareaRef}
                maxRows={4}
                autoFocus
                onChange={handleInputChange}
                value={message}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()

                    addMessage()

                    textareaRef.current?.focus()
                  }
                }}
                placeholder="Enter your question..."
                className="resize-none pr-28 text-base py-3 scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
              />

              <div className="grid gap-4">
                <Button
                  disabled={
                    isLoading || isDisabled || isLimitReachedError !== null
                  }
                  className="absolute bottom-[5px] right-[5px]"
                  aria-label="send message"
                  onClick={() => {
                    addMessage()

                    textareaRef.current?.focus()
                  }}
                >
                  <Send className="h-4 w-4" />
                </Button>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="w-full">
                      <Toggle
                        variant="outline"
                        className="absolute bottom-[5px] right-[57px]"
                        aria-label="quote"
                        onClick={() => setQuoteMode(!quoteMode)}
                      >
                        {quoteMode ? (
                          <QuoteIcon className="h-4 w-4" color="purple" />
                        ) : (
                          <MessageCircleIcon className="h-4 w-4" color="blue" />
                        )}
                      </Toggle>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={50}>
                      <div className="flex flex-wrap items-center">
                        <span>Switch between </span>
                        <span className="text-blue-700 flex items-center">
                          <MessageCircleIcon
                            className="inline-block px-1"
                            height={22}
                            width={22}
                          />{' '}
                          Chat Mode
                        </span>
                        <span className="mx-1">and</span>
                        <span className="text-purple-700 flex items-center">
                          <QuoteIcon
                            className="inline-block px-1"
                            height={22}
                            width={22}
                          />{' '}
                          Quote Mode
                        </span>
                        .
                        <span>
                          Quote mode retrieves relevant passages. Chat mode uses
                          your chat history to answer questions and generate
                          relevant passages.
                        </span>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInput
