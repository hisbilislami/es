import { Icon } from "@iconify/react/dist/iconify.js";
import { Button, Card, Grid, List } from "@mantine/core";
import { Form, useFetcher, useSearchParams } from "@remix-run/react";
import { useEffect, useMemo, useRef, useState } from "react";

import CompactCard from "~/components/card/compact-card";
import { useDialog } from "~/context/DialogContext";
import { action } from "~/routes/api/peruri/kyc/route";
import { convertFileToBase64 } from "~/utils/string-helper";

const RECORDING_LIMIT_SECONDS = 20;

function KycPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [searchParams] = useSearchParams();

  const typeAction = useMemo(() => {
    const action = searchParams.get("action");
    return action === "renewal" || action === "verify" ? action : "verify";
  }, [searchParams]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= RECORDING_LIMIT_SECONDS - 1) {
            stopRecording();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setRecordingTime(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const remainingSeconds = RECORDING_LIMIT_SECONDS - seconds;
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      setIsLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setVideoURL(url);
        setRecordedChunks(chunks);

        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.src = url;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing media devices:", err);
      dialog.showDialog({
        title: "Tidak Bisa mengakses kamera",
        description:
          "Pastikan peramban yang digunakan memiliki akses ke kamera anda.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const dialog = useDialog();
  const fetcher = useFetcher<typeof action>();
  const handleSave = async () => {
    if (recordedChunks.length === 0) return;

    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const base64Video = await convertFileToBase64(blob);

    const formData = new FormData();
    formData.append("action", typeAction.toString());
    if (base64Video) {
      formData.append("videoStream", base64Video);
      fetcher.submit(formData, { method: "POST", action: "/api/peruri/kyc" });
    }
  };

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      setVideoURL(null);
      setRecordedChunks([]);

      if (videoRef.current) {
        videoRef.current.src = "";
      }
    }
  }, [fetcher.state, fetcher.data]);

  const recordingInstructions = [
    "Pastikan berada di tempat dengan pencahayaan yang baik.",
    "Dilarang memakai kacamata.",
    "Perekaman video durasi 8 detik tanpa jeda.",
    "Kedipkan mata 2 kali selama 4 detik.",
    "Membuka mulut selama 4 detik.",
  ];

  return (
    <div className="p-6 flex flex-col gap-4">
      <Form method="POST" encType="multipart/form-data">
        <CompactCard
          title={`${typeAction !== "verify" ? "Pembaruan Verifikasi" : "Verifikasi"} e-KYC`}
        >
          <Card.Section withBorder p="lg">
            <Grid>
              <Grid.Col
                span={8}
                p={0}
                className="bg-gray-900/60 rounded-2xl relative aspect-video"
              >
                {/* Recording Timer */}
                {isRecording && (
                  <div className="absolute top-4 left-4 bg-gray-900/60 text-white px-3 py-1 rounded-full font-medium flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    {formatTime(recordingTime)}
                  </div>
                )}

                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  controls={!isRecording && videoURL !== null}
                  className="w-full object-cover h-full rounded-2xl"
                />
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 p-4 bg-gray-900/60 flex gap-4 rounded-2xl">
                  <Button
                    size="md"
                    color="red"
                    leftSection={
                      <Icon icon="tabler:square" className="w-5 h-5" />
                    }
                    onClick={stopRecording}
                    disabled={!isRecording}
                  >
                    Berhenti
                  </Button>

                  <Button
                    size="md"
                    color="tmGreen"
                    leftSection={
                      <Icon icon="tabler:video" className="w-5 h-5" />
                    }
                    onClick={startRecording}
                    disabled={isRecording || isLoading}
                    loading={isLoading}
                  >
                    {videoURL ? "Rekam Ulang" : "Rekam"}
                  </Button>
                </div>
              </Grid.Col>

              <Grid.Col span={4}>
                <CompactCard title="Petunjuk Rekam Wajah" withBorder>
                  <Card.Section withBorder inheritPadding p="lg">
                    <List withPadding style={{ listStyle: "disc" }}>
                      {recordingInstructions.map((i, idx) => (
                        <List.Item key={`recording-instruction-${idx}`}>
                          {i}
                        </List.Item>
                      ))}
                    </List>
                  </Card.Section>
                </CompactCard>
              </Grid.Col>
            </Grid>
          </Card.Section>

          <Card.Section p="lg" className="flex justify-end gap-4">
            <Button
              leftSection={
                <Icon icon="tabler:device-floppy" className="h-4 w-4" />
              }
              className="font-normal"
              onClick={handleSave}
              disabled={!videoURL}
              loading={fetcher.state !== "idle"}
            >
              Simpan
            </Button>
          </Card.Section>
        </CompactCard>
      </Form>
    </div>
  );
}

export default KycPage;
