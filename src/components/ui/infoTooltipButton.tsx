import { Info } from 'lucide-react'
import { Button } from './button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip'

function InfoTooltipButton({ content }: { content: string }) {
  return (
    <div>
      {' '}
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger>
            {' '}
            <Button
              variant="ghost"
              className="gap-1.5 rounded-sm"
              aria-label="info"
              size="iconSm"
            >
              <Info className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{content}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

export default InfoTooltipButton
