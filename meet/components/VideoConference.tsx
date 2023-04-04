import * as React from "react";

import {
	LayoutContextProvider,
	useCreateLayoutContext,
	RoomAudioRenderer,
	ControlBar,
	FocusLayout,
	FocusLayoutContainer,
	Chat,
	ConnectionStateToast,
	CarouselView,
	GridLayout,
	TrackContext,
	MessageFormatter,
	useTracks,
} from "@livekit/components-react";

import {
	isEqualTrackRef,
	isTrackReference,
	WidgetState,
} from "@livekit/components-core";

import { Track } from "livekit-client";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { usePinnedTracks } from "../hooks/usePinnedTracks";

const BotIdentity = "livegpt";

export interface VideoConferenceProps
	extends React.HTMLAttributes<HTMLDivElement> {
	chatMessageFormatter?: MessageFormatter;
}

export function VideoConference({
	chatMessageFormatter,
	...props
}: VideoConferenceProps) {
	const [widgetState, setWidgetState] = React.useState<WidgetState>({
		showChat: false,
	});

	const isMobile = useMediaQuery(`(max-width: 660px)`);

	const tracks = useTracks(
		[
			{ source: Track.Source.Camera, withPlaceholder: true },
			{ source: Track.Source.ScreenShare, withPlaceholder: false },
		],
		{ updateOnlyOn: [] }
	);

	const layoutContext = useCreateLayoutContext();

	const screenShareTracks = tracks
		.filter(isTrackReference)
		.filter((track) => track.publication.source === Track.Source.ScreenShare);

	const focusTrack = usePinnedTracks(layoutContext)?.[0];
	const carouselTracks = tracks.filter(
		(track) => !isEqualTrackRef(track, focusTrack)
	);

	React.useEffect(() => {
		// if screen share tracks are published, and no pin is set explicitly, auto set the screen share
		if (
			(layoutContext.pin.state && layoutContext.pin.state?.length > 0) ||
			screenShareTracks.length === 0
		) {
			return;
		}
		layoutContext.pin.dispatch?.({
			msg: "set_pin",
			trackReference: screenShareTracks[0],
		});
	}, [
		JSON.stringify(screenShareTracks.map((ref) => ref.publication.trackSid)),
	]);

	return (
		<div className="lk-video-conference" {...props}>
			<LayoutContextProvider
				value={layoutContext}
				// onPinChange={handleFocusStateChange}
				onWidgetChange={setWidgetState}
			>
				<div className="lk-video-conference-inner">
					{!focusTrack ? (
						<div className="lk-grid-layout-wrapper">
							<GridLayout tracks={tracks}>
								<TrackContext.Consumer>
									{(track) => {
										if (track?.participant.sid == BotIdentity) {

										} else {

										}
									}}
								</TrackContext.Consumer>
							</GridLayout>
						</div>
					) : (
						<div className="lk-focus-layout-wrapper">
							<FocusLayoutContainer>
								<CarouselView tracks={carouselTracks} />
								{focusTrack && <FocusLayout track={focusTrack} />}
							</FocusLayoutContainer>
						</div>
					)}
					<ControlBar
						variation={isMobile ? "minimal" : "verbose"}
						controls={{ chat: true }}
					/>
				</div>
				<Chat
					style={{ display: widgetState.showChat ? "flex" : "none" }}
					messageFormatter={chatMessageFormatter}
				/>
			</LayoutContextProvider>
			<RoomAudioRenderer />
			<ConnectionStateToast />
		</div>
	);
}
