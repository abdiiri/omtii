import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseImageUploadOptions {
  bucket: string;
  folder?: string;
}

export function useImageUpload({ bucket, folder = "" }: UseImageUploadOptions) {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file: File, userId: string): Promise<string | null> => {
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = folder ? `${userId}/${folder}/${fileName}` : `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const uploadMultipleImages = async (files: File[], userId: string): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const url = await uploadImage(file, userId);
      if (url) urls.push(url);
    }
    return urls;
  };

  return { uploadImage, uploadMultipleImages, uploading };
}
