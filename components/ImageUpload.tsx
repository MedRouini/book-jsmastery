"use client";

import { useToast } from "@/hooks/use-toast";
import { config } from "@/lib/config";
import { IKImage, IKUpload, ImageKitProvider } from "imagekitio-next";
import Image from "next/image";
import { useRef, useState } from "react";

const authenticator = async () => {
  try {
    const response = await fetch(`${config.env.apiEndpoint}/api/auth/imageKit`);
    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Request failed with status ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();
    const { signature, expire, token } = data;
    return data;
  } catch (error: any) {
    throw new Error("Authentication request failed " + error.message);
  }
};
const ImageUpload = ({
  onFileChange,
}: {
  onFileChange: (filePath: string) => void;
}) => {
  const ikUploadRef = useRef(null);
  const [file, setFile] = useState<{ filePath: string } | null>(null);
  const { toast } = useToast();

  const {
    env: {
      imageKit: { publicKey, urlEndpoint },
    },
  } = config;

  const onError = (error: any) => {
    console.log(error);
    toast({
      title: "Error uploading image",
      description: "Error",
    });
  };
  const onSuccess = (res: any) => {
    setFile(res);
    onFileChange(res.filePath);
    toast({
      title: "Image uploaded sucessfully",
      description: `${res.filePath} uploaded sucessfully!`,
    });
  };
  return (
    <ImageKitProvider
      publicKey={publicKey}
      urlEndpoint={urlEndpoint}
      authenticator={authenticator}
    >
      <IKUpload
        onError={onError}
        onSuccess={onSuccess}
        fileName="test.png"
        ref={ikUploadRef}
        className="hidden"
      />

      <button
        className="upload-btn"
        onClick={(e) => {
          e.preventDefault();

          if (ikUploadRef.current) {
            ikUploadRef.current?.click();
          }
        }}
      >
        <Image
          src={"/icons/upload.svg"}
          alt="upload icon"
          width={20}
          height={20}
          className="object-contain"
        />
        <p className="text-base text-light-100">Upload file</p>
        {file && <p className="upload-filename">{file.filePath}</p>}
      </button>
      {file && (
        <IKImage
          alt={file.filePath}
          path={file.filePath}
          width={500}
          height={300}
        />
      )}
    </ImageKitProvider>
  );
};

export default ImageUpload;
