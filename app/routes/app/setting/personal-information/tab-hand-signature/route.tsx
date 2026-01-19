import {
  getFormProps,
  getInputProps,
  useForm,
  useInputControl,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Button, Card, Grid, Group, Image, Text } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useDisclosure } from "@mantine/hooks";
import { ActionFunctionArgs } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import CompactCard from "~/components/card/compact-card";
import MessageBanner from "~/components/message/message-banner";
import { useDialog } from "~/context/DialogContext";
import { convertFileToBase64 } from "~/utils/string-helper";
import { cn } from "~/utils/style";

import { loader } from "../route";

import handSignatureActionHandler from "./action";
import { handSignatureFormSchema } from "./constant";
import CreateSignatureDialog from "./create-signature-dialog";

export async function action({ request }: ActionFunctionArgs) {
  return handSignatureActionHandler(request);
}

function TabHandSignature() {
  const loaderData = useLoaderData<typeof loader>();
  const lastResult = useActionData<typeof action>();

  const [isSignatureVerified, setIsSignatureVerified] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const dropzoneOpenRef = useRef<(() => void) | null>(null);

  const { showDialog } = useDialog();

  useEffect(() => {
    if (
      loaderData.data?.sign_sync_to_peruri ||
      lastResult?.data?.signSyncToPeruri
    ) {
      setIsSignatureVerified(true);
    }
  }, [
    loaderData.data?.sign_sync_to_peruri,
    lastResult?.data?.signSyncToPeruri,
  ]);

  /* useEffect(() => { */
  /*   const isVerified = */
  /*     (loaderData && */
  /*       "data" in loaderData && */
  /*       loaderData.data?.sign_sync_to_peruri) || */
  /*     (lastResult && */
  /*       "data" in lastResult && */
  /*       typeof lastResult.data === "object" && */
  /*       lastResult.data?.signSyncToPeruri); */
  /**/
  /*   if (isVerified) { */
  /*     setIsSignatureVerified(true); */
  /*   } */
  /* }, [loaderData, lastResult]); */

  useEffect(() => {
    if (loaderData.data?.signature_file_url) {
      setFileUrl(loaderData.data.signature_file_url);
    }
  }, [loaderData.data?.signature_file_url]);

  const messageBanner = useMemo(() => {
    return isSignatureVerified
      ? {
          title: "Tanda Tangan Tervalidasi",
          description:
            "Tanda tangan telah dilakukan verifikasi dan disetujui oleh Peruri",
        }
      : {
          title: "Validasi Tanda Tangan",
          description:
            "Tanda tangan akan dilakukan verifikasi terlebih dahulu ke Peruri",
        };
  }, [isSignatureVerified]);

  const [form, fields] = useForm({
    lastResult,
    constraint: getZodConstraint(handSignatureFormSchema),
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: handSignatureFormSchema });
    },
  });

  const fieldBase64Control = useInputControl(fields.fileBase64);

  const fieldError = useMemo(
    () => fields.fileBase64?.errors?.[0] ?? "",
    [fields.fileBase64?.errors],
  );

  const setSignatureFile = (objUrl: string, base64: string) => {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setIsSignatureVerified(false);
    fieldBase64Control.change(base64);
    setFileUrl(objUrl);
  };

  const onDrop = useCallback(
    async (files: File[]) => {
      try {
        if (files?.length > 0) {
          const selectedFile = files[0];
          const fileBase64 = await convertFileToBase64(selectedFile);
          setSignatureFile(URL.createObjectURL(selectedFile), fileBase64);
        }
      } catch (error) {
        console.error(error);
        showDialog({
          title: "Terjadi Kesalahan",
          type: "error",
          description: "Terjadi kesalahan saat membaca file",
        });
      }
    },
    [fileUrl, fieldBase64Control, showDialog],
  );

  const [
    isDialogSignatureBoardOpen,
    { open: openDialogSignatureBoard, close: closeDialogSignatureBoard },
  ] = useDisclosure(false);

  const navigation = useNavigation();
  const isLoading = navigation.state !== "idle";

  const dropzoneInputProps = getInputProps(fields.fileObject, { type: "file" });

  return (
    <>
      <Form method="POST" {...getFormProps(form)} encType="multipart/form-data">
        <CompactCard title="Tanda Tangan" className="h-1/2">
          <Card.Section withBorder inheritPadding p="lg">
            <Grid>
              <Grid.Col span={6}>
                <div
                  className={cn(
                    "rounded-2xl",
                    "border-spacing-1 border-4 border-dashed",
                    fieldError
                      ? "border-red-400 bg-[var(--mantine-color-red-0)]"
                      : "border-gray-300 bg-[var(--mantine-color-gray-0)]",
                  )}
                >
                  <Dropzone
                    {...dropzoneInputProps}
                    key={dropzoneInputProps.key}
                    openRef={dropzoneOpenRef}
                    onDrop={onDrop}
                    maxSize={5 * 1024 ** 2}
                    accept={IMAGE_MIME_TYPE.filter(
                      (mt) => mt.includes("png") || mt.includes("jpeg"),
                    )}
                    className="border-none rounded-t-2xl !bg-transparent"
                    disabled={isLoading}
                  >
                    <Group
                      justify="center"
                      gap="xl"
                      mih={220}
                      style={{ pointerEvents: "none" }}
                    >
                      <Dropzone.Accept>
                        <Icon icon="tabler:upload" className="w-12 h-12" />
                      </Dropzone.Accept>
                      <Dropzone.Reject>
                        <Icon
                          icon="tabler:x"
                          className="w-12 h-12 text-[var(--mantine-color-red-6)]"
                        />
                      </Dropzone.Reject>
                      <Dropzone.Idle>
                        {fileUrl ? (
                          <Image
                            src={fileUrl}
                            h={200}
                            w="auto"
                            fit="contain"
                            alt="Uploaded"
                          />
                        ) : (
                          <div className="flex flex-col items-center">
                            <Image
                              src="/image/form-sign.svg"
                              className="w-20 h-20"
                            />
                            <Text size="md" c="dark.4" inline mt="lg">
                              Buat tanda tangan atau unggah file (JPG atau PNG,
                              Max. 5MB)
                            </Text>
                          </div>
                        )}
                      </Dropzone.Idle>
                    </Group>
                  </Dropzone>

                  <div className="flex items-center gap-3 pb-8 pt-2 px-8">
                    <Button
                      leftSection={
                        <Icon icon="tabler:edit" className="w-4 h-4" />
                      }
                      variant="default"
                      className="font-normal"
                      fullWidth
                      size="md"
                      onClick={openDialogSignatureBoard}
                      disabled={isLoading}
                      loading={isLoading}
                    >
                      Buat e-Sign
                    </Button>
                    <Button
                      leftSection={
                        <Icon icon="tabler:upload" className="w-4 h-4" />
                      }
                      variant="default"
                      className="font-normal"
                      fullWidth
                      size="md"
                      onClick={() => dropzoneOpenRef.current?.()}
                      disabled={isLoading}
                      loading={isLoading}
                    >
                      Unggah File
                    </Button>
                  </div>
                </div>
                {fieldError && (
                  <Text c="red.5" size="sm" mt="sm">
                    {fieldError}
                  </Text>
                )}
              </Grid.Col>

              <Grid.Col span={6}>
                <MessageBanner
                  type={isSignatureVerified ? "success" : "info"}
                  title={messageBanner.title}
                  description={messageBanner.description}
                />
              </Grid.Col>
            </Grid>
          </Card.Section>

          <Card.Section p="lg" className="flex justify-end gap-4">
            <Button
              type="submit"
              leftSection={
                <Icon icon="tabler:device-floppy" className="h-4 w-4" />
              }
              className="font-normal"
              loading={isLoading}
            >
              Simpan
            </Button>
          </Card.Section>
        </CompactCard>
      </Form>

      <CreateSignatureDialog
        opened={isDialogSignatureBoardOpen}
        onSave={(objUrl, _file, base64) => {
          setSignatureFile(objUrl, base64);
        }}
        onClose={closeDialogSignatureBoard}
      />
    </>
  );
}

export default TabHandSignature;
