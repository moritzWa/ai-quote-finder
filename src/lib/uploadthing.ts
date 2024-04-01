import { generateReactHelpers } from '@uploadthing/react/hooks';

import type { OurFileRouter } from '@/app/api/uploadthing/core';
import { UTApi } from "uploadthing/server";


export const { useUploadThing } = generateReactHelpers<OurFileRouter>() 
export const utapi = new UTApi();