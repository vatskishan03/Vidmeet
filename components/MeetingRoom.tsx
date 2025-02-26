// 'use client';
// import { useState } from 'react';
// import {
//   CallControls,
//   CallParticipantsList,
//   CallStatsButton,
//   CallingState,
//   PaginatedGridLayout,
//   SpeakerLayout,
//   useCallStateHooks,
// } from '@stream-io/video-react-sdk';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { Users, LayoutList } from 'lucide-react';

// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from './ui/dropdown-menu';
// import Loader from './Loader';
// import EndCallButton from './EndCallButton';
// import { cn } from '@/lib/utils';

// type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

// const MeetingRoom = () => {
//   const searchParams = useSearchParams();
//   const isPersonalRoom = !!searchParams.get('personal');
//   const router = useRouter();
//   const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
//   const [showParticipants, setShowParticipants] = useState(false);
//   const { useCallCallingState } = useCallStateHooks();

//   // for more detail about types of CallingState see: https://getstream.io/video/docs/react/ui-cookbook/ringing-call/#incoming-call-panel
//   const callingState = useCallCallingState();

//   if (callingState !== CallingState.JOINED) return <Loader />;

//   const CallLayout = () => {
//     switch (layout) {
//       case 'grid':
//         return <PaginatedGridLayout />;
//       case 'speaker-right':
//         return <SpeakerLayout participantsBarPosition="left" />;
//       default:
//         return <SpeakerLayout participantsBarPosition="right" />;
//     }
//   };

//   return (
//     <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
//       <div className="relative flex size-full items-center justify-center">
//         <div className=" flex size-full max-w-[1000px] items-center">
//           <CallLayout />
//         </div>
//         <div
//           className={cn('h-[calc(100vh-86px)] hidden ml-2', {
//             'show-block': showParticipants,
//           })}
//         >
//           <CallParticipantsList onClose={() => setShowParticipants(false)} />
//         </div>
//       </div>
//       {/* video layout and call controls */}
//       <div className="fixed bottom-0 flex w-full items-center justify-center gap-5">
//         <CallControls onLeave={() => router.push(`/`)} />

//         <DropdownMenu>
//           <div className="flex items-center">
//             <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]  ">
//               <LayoutList size={20} className="text-white" />
//             </DropdownMenuTrigger>
//           </div>
//           <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
//             {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index) => (
//               <div key={index}>
//                 <DropdownMenuItem
//                   onClick={() =>
//                     setLayout(item.toLowerCase() as CallLayoutType)
//                   }
//                 >
//                   {item}
//                 </DropdownMenuItem>
//                 <DropdownMenuSeparator className="border-dark-1" />
//               </div>
//             ))}
//           </DropdownMenuContent>
//         </DropdownMenu>
//         <CallStatsButton />
//         <button onClick={() => setShowParticipants((prev) => !prev)}>
//           <div className=" cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]  ">
//             <Users size={20} className="text-white" />
//           </div>
//         </button>
//         {!isPersonalRoom && <EndCallButton />}
//       </div>
//     </section>
//   );
// };

// export default MeetingRoom;

// 'use client';
// import { useState, useEffect } from 'react';
// import {
//   CallControls,
//   CallParticipantsList,
//   CallStatsButton,
//   CallingState,
//   PaginatedGridLayout,
//   SpeakerLayout,
//   useCallStateHooks,
//   useCall,
// } from '@stream-io/video-react-sdk';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { Users, LayoutList } from 'lucide-react';

// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from './ui/dropdown-menu';
// import Loader from './Loader';
// import EndCallButton from './EndCallButton';
// import { cn } from '@/lib/utils';

// type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

// const MeetingRoom = () => {
//   const searchParams = useSearchParams();
//   const isPersonalRoom = !!searchParams.get('personal');
//   const router = useRouter();
//   const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
//   const [showParticipants, setShowParticipants] = useState(false);
//   const { useCallCallingState } = useCallStateHooks();
//   const call = useCall();

//   // For more detail about types of CallingState, see:
//   // https://getstream.io/video/docs/react/ui-cookbook/ringing-call/#incoming-call-panel
//   const callingState = useCallCallingState();

//   // ---------------------- Transcription Logic ----------------------
//   useEffect(() => {
//     if (!call) return;

//     const startRecording = async () => {
//       try {
//         // Request user permission for microphone
//         const mediaStream = await navigator.mediaDevices.getUserMedia({
//           audio: true,
//         });

//         const mediaRecorder = new MediaRecorder(mediaStream);
//         let chunks: BlobPart[] = [];

//         mediaRecorder.ondataavailable = (event) => {
//           if (event.data.size > 0) {
//             chunks.push(event.data);
//           }
//         };

//         mediaRecorder.onstop = async () => {
//           // Combine chunks into a single WAV blob
//           const audioBlob = new Blob(chunks, { type: 'audio/wav' });
//           const formData = new FormData();

//           formData.append('audio', audioBlob);
//           formData.append('meetingId', call.id);

//           await fetch('/api/transcribe', {
//             method: 'POST',
//             body: formData,
//           });
//         };

//         // Start recording
//         mediaRecorder.start();

//         // When the meeting ends, stop recording
//         call.on('call.ended', () => {
//           mediaRecorder.stop();
//           mediaStream.getTracks().forEach((track) => track.stop());
//         });
//       } catch (error) {
//         console.error('Error capturing audio:', error);
//       }
//     };

//     startRecording();
//   }, [call]);
//   // ---------------------------------------------------------------

//   if (callingState !== CallingState.JOINED) return <Loader />;

//   const CallLayout = () => {
//     switch (layout) {
//       case 'grid':
//         return <PaginatedGridLayout />;
//       case 'speaker-right':
//         return <SpeakerLayout participantsBarPosition="left" />;
//       default:
//         return <SpeakerLayout participantsBarPosition="right" />;
//     }
//   };

//   return (
//     <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
//       <div className="relative flex size-full items-center justify-center">
//         <div className="flex size-full max-w-[1000px] items-center">
//           <CallLayout />
//         </div>
//         <div
//           className={cn('h-[calc(100vh-86px)] hidden ml-2', {
//             'show-block': showParticipants,
//           })}
//         >
//           <CallParticipantsList onClose={() => setShowParticipants(false)} />
//         </div>
//       </div>
//       {/* video layout and call controls */}
//       <div className="fixed bottom-0 flex w-full items-center justify-center gap-5">
//         <CallControls onLeave={() => router.push(`/`)} />

//         <DropdownMenu>
//           <div className="flex items-center">
//             <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
//               <LayoutList size={20} className="text-white" />
//             </DropdownMenuTrigger>
//           </div>
//           <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
//             {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index) => (
//               <div key={index}>
//                 <DropdownMenuItem
//                   onClick={() =>
//                     setLayout(item.toLowerCase() as CallLayoutType)
//                   }
//                 >
//                   {item}
//                 </DropdownMenuItem>
//                 <DropdownMenuSeparator className="border-dark-1" />
//               </div>
//             ))}
//           </DropdownMenuContent>
//         </DropdownMenu>
//         <CallStatsButton />
//         <button onClick={() => setShowParticipants((prev) => !prev)}>
//           <div className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
//             <Users size={20} className="text-white" />
//           </div>
//         </button>
//         {!isPersonalRoom && <EndCallButton />}
//       </div>
//     </section>
//   );
// };

// export default MeetingRoom;


'use client';

import React, { useState, useEffect } from 'react';
import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  useCall,
} from '@stream-io/video-react-sdk';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, LayoutList } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Loader from './Loader';
import EndCallButton from './EndCallButton';
import { cn } from '@/lib/utils';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const router = useRouter();
  const { useCallCallingState } = useCallStateHooks();
  const call = useCall();
  const callingState = useCallCallingState();

  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);

  useEffect(() => {
    if (!call) return;

    // Automatically start recording once user joins
    const startRecording = async () => {
      try {
        // Request user permission for microphone
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        const mediaRecorder = new MediaRecorder(mediaStream);
        const chunks: BlobPart[] = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        // When user stops the recording (e.g., ends the call)
        mediaRecorder.onstop = async () => {
          try {
            const audioBlob = new Blob(chunks, { type: 'audio/wav' });
            const formData = new FormData();
            formData.append('audio', audioBlob);
            formData.append('meetingId', call.id);

            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/transcribe`,
              {
                method: 'POST',
                body: formData,
              }
            );

            if (!response.ok) {
              throw new Error('Failed to transcribe audio');
            }
            // Optionally handle success UI updates/logging here
          } catch (error) {
            console.error('Error during transcription:', error);
          }
        };

        // Start recording
        mediaRecorder.start();

        // Stop recording when call ends
        call.on('call.ended', () => {
          mediaRecorder.stop();
        });
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    };

    if (callingState === CallingState.JOINED) {
      startRecording();
    }
  }, [call, callingState]);

  if (callingState !== CallingState.JOINED) {
    return <Loader />;
  }

  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-left':
        return <SpeakerLayout participantsBarPosition="left" />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="right" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      <div className="relative flex size-full items-center justify-center">
        <div className="flex size-full max-w-[1000px] items-center">
          <CallLayout />
        </div>
        <div
          className={cn('h-[calc(100vh-86px)] hidden ml-2', {
            'show-block': showParticipants,
          })}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>
      {/* video layout and call controls */}
      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5">
        <CallControls onLeave={() => router.push('/')} />
        <DropdownMenu>
          <div className="flex items-center">
            <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
              <LayoutList size={20} className="text-white" />
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
            {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index) => (
              <div key={index}>
                <DropdownMenuItem
                  onClick={() =>
                    setLayout(item.toLowerCase().replace('-', '') as CallLayoutType)
                  }
                >
                  {item}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="border-dark-1" />
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <CallStatsButton />
        <button onClick={() => setShowParticipants((prev) => !prev)}>
          <div className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
            <Users size={20} className="text-white" />
          </div>
        </button>
        {!isPersonalRoom && <EndCallButton />}
      </div>
    </section>
  );
};

export default MeetingRoom;