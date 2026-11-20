import TrackPlayer from 'react-native-track-player';

import { PlaybackService } from './playback-service';

// O serviço de reprodução precisa ser registrado antes do app montar.
TrackPlayer.registerPlaybackService(() => PlaybackService);
