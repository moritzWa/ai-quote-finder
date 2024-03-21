'use client'

import { trpc } from '@/app/_trpc/client'
// import { OurFileRouter } from '@/app/api/uploadthing/core'
import { freePlan, proPlan } from '@/config/stripe'
import { useUploadThing } from '@/lib/uploadthing'
import { Cloud, File, Loader2, UploadIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Dropzone from 'react-dropzone'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import InfoTooltipButton from './ui/infoTooltipButton'
import { Label } from './ui/label'
import { Progress } from './ui/progress'
import { Switch } from './ui/switch'
import { useToast } from './ui/use-toast'

const CustomUploadDropzone = ({ isSubscribed }: { isSubscribed: boolean }) => {
  const router = useRouter()

  const [isUploading, setIsUploading] = useState<boolean>(false)

  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const { toast } = useToast()

  const { startUpload } = useUploadThing(
    isSubscribed ? 'proPlanUploader' : 'freePlanUploader',
  )

  // const {
  //   startUpload,
  //   onUploadError: (error) => {
  //     console.error('Error during upload:', error);
  //   },
  // } = useUploadThing(isSubscribed ? 'proPlanUploader' : 'freePlanUploader');

  const {
    data: userPreference,
    isLoading,
    refetch,
  } = trpc.getUserPrivateUploadPreference.useQuery(undefined, {
    enabled: true,
  })

  const mutation = trpc.updateUserPrivateUploadPreference.useMutation()

  // Initialize the state of the toggle with the fetched preference
  const [shareWithCommunity, setShareWithCommunity] = useState(
    userPreference || true,
  )

  const handleToggleChange = (value: any) => {
    console.log(
      'handleToggleChange:',
      value,
      'meaning they prefer',
      !value ? 'private' : 'public',
    )
    setShareWithCommunity(value)
    mutation.mutate({ prefersPrivateUpload: !value })
    refetch()
  }

  const { mutate: startPolling } = trpc.getFile.useMutation({
    onSuccess: (file) => {
      router.push(`/dashboard/${file.id}`)
    },
    retry: true,
    retryDelay: 500,
  })

  const startSimulatedProgress = () => {
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        if (prevProgress >= 95) {
          clearInterval(interval)
          return prevProgress
        }
        return prevProgress + 5
      })
    }, 500)

    return interval
  }

  const possiblePlanFileSize = !isSubscribed
    ? freePlan.maxFileSize
    : proPlan.maxFileSize

  return (
    <>
      <div className="flex items-center space-x-2">
        {isLoading ? (
          '...loading'
        ) : (
          <>
            <Switch
              checked={shareWithCommunity}
              onCheckedChange={(v) => handleToggleChange(v)}
              id="shared-with-communit"
            />
            <Label htmlFor="shared-with-communit">Share with Communit</Label>
            <InfoTooltipButton content="We will remove your book if we receive a DMCA takedown request from its alleged copy right owner." />
          </>
        )}
      </div>
      old vanilla react-dropzone dropzone
      <Dropzone
        // @ts-ignore
        onUploadError={(error: Error) => {
          alert(`ERROR! ${error.message}`)
        }}
        multiple={false}
        onDrop={async (acceptedFile) => {
          setIsUploading(true)

          const progressInterval = startSimulatedProgress()

          // handle file uploading
          const res = await startUpload(acceptedFile)

          if (!res) {
            console.log('res vaule from startUpload', res)

            return toast({
              title: 'Something went wrong (check file size)',
              description: `Please try again later. Note that you can only upload files up to ${possiblePlanFileSize}`,
              variant: 'default',
            })
          }

          const [fileResponse] = res

          const key = fileResponse?.key

          if (!key) {
            return toast({
              title: 'Something went wrong (check file size)',
              description: `Please try again later. Note that you can only upload files up to ${possiblePlanFileSize}`,
              variant: 'default',
            })
          }

          clearInterval(progressInterval)
          setUploadProgress(100)

          // once upload is finished start polling for file
          startPolling({ key })
        }}
      >
        {({ getRootProps, getInputProps, acceptedFiles }) => (
          <div
            {...getRootProps()}
            className="border h-64 border-dashed border-gray-300 rounded-lg"
          >
            <div className="flex items-center justify-center h-full w-full">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Cloud className="h-6 w-6 text-zinc-500 mb-2" />
                  <p className="mb-2 text-sm text-zinc-700">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-zinc-500">
                    PDF (up to {possiblePlanFileSize})
                  </p>
                </div>

                {acceptedFiles && acceptedFiles[0] ? (
                  <div className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200">
                    <div className="px-3 py-2 h-full grid place-items-center">
                      <File className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="px-3 py-2 h-full text-sm truncate">
                      {acceptedFiles[0].name}
                    </div>
                  </div>
                ) : null}

                {isUploading ? (
                  <div className="w-full mt-4 max-w-xs mx-auto">
                    <Progress
                      color={uploadProgress === 100 ? 'bg-green-500' : ''}
                      value={uploadProgress}
                      className="h-1 w-full bg-zinc-200"
                    />
                    {uploadProgress === 100 ? (
                      <div className="flex gap-1 items-center justify-center text-sm text-zinc-700 text-center pt-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Redirecting...
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <input
                  {...getInputProps()}
                  type="file"
                  id="dropzone-file"
                  className="hidden"
                  accept="application/pdf,.pdf,.epub"
                />
              </label>
            </div>
          </div>
        )}
      </Dropzone>
      {/* new dropzone
      <UploadDropzone<OurFileRouter, 'freePlanUploader' | 'proPlanUploader'>
        endpoint={isSubscribed ? 'proPlanUploader' : 'freePlanUploader'}
        onClientUploadComplete={(res: any) => {
          // Do something with the response
          console.log('Files: ', res)
          alert('Upload Completed')
          router.push(`/dashboard/${res[0].id}`)
        }}
        onUploadError={(error: Error) => {
          console.log(error)
        }}
        onUploadBegin={(name: any) => {
          // Do something once upload begins
          console.log('Uploading: ', name)
          setIsUploading(true)
          startSimulatedProgress()
        }}
      /> */}
    </>
  )
}

const UploadButton = ({ isSubscribed }: { isSubscribed: boolean }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setIsOpen(v)
        }
      }}
    >
      <DialogTrigger onClick={() => setIsOpen(true)} asChild>
        <Button>
          <UploadIcon className="mr-2 h-4 w-4" />
          Upload PDF
        </Button>
      </DialogTrigger>

      <DialogContent>
        <CustomUploadDropzone isSubscribed={isSubscribed} />
      </DialogContent>
    </Dialog>
  )
}

export default UploadButton
