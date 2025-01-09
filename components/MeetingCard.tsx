"use client";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

interface MeetingCardProps {
  icon: string;
  title: string;
  date: string;
  isPreviousMeeting?: boolean;
  buttonIcon1?: string;
  buttonText?: string;
  handleClick: () => void;
  link: string;
  meetingId: string;

}

export function MeetingCard({
  icon,
  title,
  date,
  isPreviousMeeting,
  buttonIcon1,
  handleClick,
  link,
  buttonText,
  meetingId 
}: MeetingCardProps) {
  const { toast } = useToast();
  
  const getMeetingSummary = async (id: string) => {
    if (!id) {
      toast({
        title: "Error",
        description: "Meeting ID not found",
        variant: "destructive",
      });
      return;
    }
  
    try {
      const response = await fetch(`/api/summary/${id}`);
      const data = await response.json();
      
      if (response.status === 404) {
        toast({
          title: "No Transcription Found",
          description: "This meeting hasn't been transcribed",
          variant: "destructive",
        });
        return;
      }
  
      if (!response.ok) {
        throw new Error(data.error);
      }
  
      const bulletPoints = data.summary
        .split('.')
        .filter((point: string) => point.trim())
        .map((point: string) => `• ${point.trim()}`)
        .join('\n');
  
      toast({
        title: "Meeting Summary",
        description: bulletPoints,
        duration: 10000,
      });
  
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get meeting summary';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  return (
    <section className="relative flex min-h-[258px] w-full flex-col justify-between rounded-[14px] bg-dark-1 px-5 py-8 xl:max-w-[568px]">
      {/* Three-dot menu for previous meetings */}
      {isPreviousMeeting && (
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="cursor-pointer rounded-full p-2 hover:bg-dark-2">
              <MoreVertical size={20} className="text-white" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-dark-1 text-white">
              <DropdownMenuItem
                onClick={() => {
                  getMeetingSummary(meetingId);
                }}
              >
                Meeting Summary
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <article className="flex flex-col gap-5">
        <Image src={icon} alt="upcoming" width={28} height={28} />
        <div className="flex justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-base font-normal">{date}</p>
          </div>
        </div>
      </article>

      <article className={cn("flex justify-center relative", {})}>
        <div className="flex gap-2">
          <Button onClick={handleClick} className="rounded bg-blue-1 px-6">
            {buttonIcon1 && (
              <Image src={buttonIcon1} alt="feature" width={20} height={20} />
            )}
            &nbsp; {buttonText}
          </Button>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(link);
              toast({
                title: "Link Copied",
              });
            }}
            className="bg-dark-4 px-6"
          >
            <Image src="/icons/copy.svg" alt="copy link" width={20} height={20} />
            &nbsp; Copy Link
          </Button>
        </div>
      </article>
    </section>
  );
}

export default MeetingCard;