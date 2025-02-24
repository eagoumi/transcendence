import { React, useState, useRef, useEffect, useContext } from 'react'
import { Trophy } from 'lucide-react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { WebSocketContext } from '../../websockets/WebSocketProvider'
import '../../i18n';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../hooks/useAuthContext'

export default function Tournament() {
  const websocket_url = import.meta.env.VITE_WEBSOCKET_URL
  const { t } = useTranslation();
  const wsRef = useRef(null);
  const navigate = useNavigate();
  const { wsManager } = useContext(WebSocketContext);
  const [matches, setMatches] = useState([
    { id: 1, round: 1, position: 1, player1: t('Player') + ' 1', player2: t('Player') + ' 2' },
    { id: 2, round: 1, position: 2, player1: t('Player') + ' 3', player2: t('Player') + ' 4' },
    { id: 3, round: 2, position: 1 },
  ]);

  const [loadingQuit, setLoadingQuit] = useState(false);
  const { user, authtoken } = useAuthContext();
  const [wrongTournament, setWrongTournament] = useState(false);
  const [eliminated, setEliminated] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [tournamentCode, setTournamentCode] = useState(queryParams.get('code'));
  const [playersPresent, setPlayersPresent] = useState(0);
  const [showMatchStartPopup, setShowMatchStartPopup] = useState(false);
  const [matchStartData, setMatchStartData] = useState(null);

  useEffect(() => {
    if (authtoken && !wsRef.current) {
      wsRef.current = new WebSocket(`${websocket_url}/api/game/ws/tournament/?token=${authtoken}&code=${tournamentCode}`);

      wsRef.current.onopen = () => {
        console.log('WebSocket connection established');
      };

      wsRef.current.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'token_expired') {
          const newToken = await refreshToken();
          if (newToken) {
            localStorage.setItem('authtoken', JSON.stringify(newToken));
            wsRef.current = new WebSocket(`${websocket_url}/api/game/ws/tournament/?token=` + JSON.stringify(newToken.access));
            console.log('WebSocket connection established with new token');
          } else {
            localStorage.removeItem('authtoken');
            navigate('/login');
          }
        } else if (message.type === 'tournament_update') {
          if (Array.isArray(message.matches) && message.matches.length > 0) {
            setMatches(message.matches);
          }
        } else if (message.type === 'match_start') {
          setMatchStartData({ opponent: message.opponent, yourName: user.username });
          setShowMatchStartPopup(true);
          setTimeout(() => {
            setShowMatchStartPopup(false);
            navigate(`/dashboard/game/pvp2d?match_id=${message.tournamentMatch_id}`);
          }, 3000);
        } else if (message.type === 'tournament_code') {
          setTournamentCode(message.code);
        } else if (message.type === 'players_ready') {
          console.log('Players ready:', message.players);
          const otherplayers = message.players.filter(player => player !== user.username);
          if (otherplayers)
            wsManager.sendMessage('Tournament players Ready: ' + message.players.length, otherplayers, "/dashboard/tournament/live");
        }
        else if (message.type === 'already_in_tournament') {
          setWrongTournament(true);
        }
        else if (message.type === 'eliminated')
          setEliminated(true);
        else if (message.type === 'players_present')
          setPlayersPresent(message.players.length);
      };

      function isInitialMatchesState() {
        return matches.length === 3 
          && matches[0].player1 === 'Player 1' && matches[0].player2 === 'Player 2'
          && matches[1].player1 === 'Player 3' && matches[1].player2 === 'Player 4'
      }

      wsRef.current.onclose = () => {
        console.log('WebSocket connection closed');
        // if (isInitialMatchesState()) {
        //   navigate('/dashboard/tournament');//mochkil
        // }
      };
      wsRef.current.onerror = (e) => console.error('WebSocket error:', e);

      return () => {
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
      };
    }
  }, [authtoken]);

  const handleQuit = () => {
    setLoadingQuit(true);
    wsRef.current.send(JSON.stringify({ type: 'quit_tournament' }));
    setTimeout(() => {
      setLoadingQuit(false);
      navigate('/dashboard/tournament');
    }, 1000);
  };

  const refreshToken = async () => {
    let refreshtokenUrl = "/api/usermanagement/api/token/refresh/"
    try {
      const response = await fetch(refreshtokenUrl, {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return null;
    }
  };

  return (
    <div className="w-full h-full justify-between flex flex-col p-8">
      <div className="mx-auto w-full h-full">
        {/* Tournament Title */}
        <div className="text-center mb-12">
          <h1 className="sm:text-6xl font-bold text-white tracking-wider zen-dots md:text-4xl text-2xl" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
            {t('TOURNAMENT')}
          </h1>
          <div className="w-48 h-1 bg-white mx-auto mt-2"></div>
        </div>

        {/* Tournament Bracket */}
        <div className="h-full text-white">
          <div className="grid xl:grid-cols-[2fr_1fr] gap-24 grid-cols-1 w-full justify-between items-center">
            <div className="mr-4 md:mr-20 lg:mr-0">
              {/* Round 1 */}
              <div className="grid grid-cols lg:grid-cols-2 items-center gap-36  space-y-16 mt-16 px-4 lg:px-4">
                <div className="space-y-16 mt-16 px-4 lg:px-4">
                  {matches.filter(m => m.round === 1).map((match) => (
                    <div key={match.id} className="relative">
                      <div className="flex flex-col gap-4">
                        <div className={`p-0 bg-transparent relative flex items-center overflow-visible rounded-xl transition-all duration-300 ${match.winner === match.player1 ? 'ring-1 ring-white' : ''}`}>
                          <div className="relative bg-black/50 border border-gray-800 overflow-hidden backdrop-blur-sm w-[100%] h-[100px] flex items-center clip-card rounded-xl">
                            <div className="w-[40px] h-full rounded-l-xl bg-[#9a77ff]"></div>
                            <span className="pl-12">{match.player1 || 'TBD'}</span>
                          </div>
                          <div className="absolute left-[100%] top-[50%] w-[13%] h-[2px] bg-white"></div>
                          <div className='absolute left-[113%] top-[50%] w-[2px] h-[118%] bg-white'></div>
                        </div>
                        <div className={`p-0 bg-transparent relative flex items-center overflow-visible transition-all duration-300 rounded-xl ${match.winner === match.player2 ? 'ring-1 ring-white' : ''}`}>
                          <div className="relative bg-black/50 border border-gray-800 overflow-hidden backdrop-blur-sm w-[100%] h-[100px] flex items-center clip-card rounded-xl">
                            <div className="w-[40px] h-full rounded-l-xl bg-[#9a77ff]"></div>
                            <span className="pl-12">{match.player2 || 'TBD'}</span>
                          </div>
                          <div className="absolute left-[100%] top-[50%] w-[13%] h-[2px] bg-white"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Final Round */}
                <div className="px-4 lg:px-4">
                  {matches.filter(m => m.round === 2).map((match) => (
                    <div key={match.id} className="relative">
                      <div className="flex flex-col gap-4">
                        <div className={`p-0 bg-transparent relative flex items-center overflow-visible transition-all duration-300 rounded-xl ${match.winner === match.player1 ? 'ring-1 ring-white' : ''}`}>
                          <div className="absolute z-[1] w-[40px] h-full rounded-l-xl bg-[#9a77ff]"></div>
                          <div className="relative bg-black/50 border border-gray-800 overflow-hidden backdrop-blur-sm w-[100%] h-[100px] flex items-center clip-card rounded-xl">
                            <span className="pl-12">{match.player1 || 'TBD'}</span>
                          </div>
                          <div className="absolute left-[100%] top-[50%] w-[13%] h-[2px] bg-white"></div>
                          <div className='absolute left-[113%] top-[50%] w-[2px] h-[118%] bg-white'></div>
                        </div>
                        <div className={`p-0 bg-transparent relative flex items-center overflow-visible transition-all duration-300 rounded-xl ${match.winner === match.player2 ? 'ring-1 ring-white' : ''}`}>
                          <div className="absolute z-[1] w-[40px] h-full rounded-l-xl bg-[#9a77ff]"></div>
                          <div className="relative bg-black/50 border border-gray-800 overflow-hidden backdrop-blur-sm w-[100%] h-[100px] flex items-center clip-card rounded-xl">
                            <span className="pl-12">{match.player2 || 'TBD'}</span>
                          </div>
                          <div className="absolute left-[100%] top-[50%] w-[13%] h-[2px] bg-white"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
          </div>

          {/* Champion Section */}
          <div className="w-full flex flex-col items-center">
          <div className="w-full flex flex-col items-center">
            <div className="mb-4">
              <Trophy className="w-24 h-24 text-yellow-400" />
              <div className="text-yellow-400 text-2xl font-bold text-center mt-2">CHAMPION</div>
            </div>
            <div className="w-[80%] bg-black/50 border border-gray-800 backdrop-blur-sm rounded-md relative overflow-hidden clip-card h-[100px] flex items-center gap-12">
              <div className='bg-[url("https://cdn.intra.42.fr/users/3feda8640ab21b2af32e1c3cd703646d/zlaarous.jpg")] bg-cover w-auto h-full aspect-square bg-violet-400'></div>
              <span className="">
                {matches.length > 0 && matches[matches.length - 1].winner || 'TBD'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex items-end flex-col  bottom-4 right-4">
        {(
          <div className="flex gap-4">
            <button
              onClick={handleQuit}
              className="px-4 py-2 bg-red-500 text-white rounded-md flex items-center gap-2"
              disabled={loadingQuit}
            >
              {loadingQuit ? <Spinner /> : 'Quit'}
            </button>
          </div>)}
        {/* tournament code */}
        <div className="text-white mt-4">
          {t('Players Present:')} {playersPresent}
        </div>
      </div>

      {/* Popup for already in tournament */}
      {wrongTournament && (
        <div className="z-50 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900/95 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-white mb-4">{t('You are already in a tournament!')}</h2>
          <button
            onClick={() => navigate('/dashboard/tournament')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {t('Go to Dashboard')}
          </button>
        </div>
      )}

      {/* Popup for eliminated */}
      {eliminated && (
        <div className="z-50 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900/95 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-white mb-4">{t('You have been eliminated from the tournament!')}</h2>
          <button
            onClick={() => setEliminated(false)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            {t('Close')}
          </button>
          <button
            onClick={() => {
                wsRef.current.send(JSON.stringify({ type: 'quit_tournament' }));
                navigate('/dashboard')
              }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {t('Go to Dashboard')}
          </button>
        </div>
      )}

      {matches.length > 0 && matches[matches.length - 1].winner && !eliminated && (
        <div className="z-50 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900/95 p-8 rounded-lg text-center ">
          <h2 className="text-2xl font-bold text-white mb-4">{t('Congratulations')} {matches[matches.length - 1].winner}! {t('You are the champion!')}</h2>
          <button
            onClick={() => {
              wsRef.current.send(JSON.stringify({ type: 'quit_tournament' }));
              navigate('/dashboard')
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {t('Finish Tournament')}
          </button>
        </div>
      )}

      {showMatchStartPopup && (
        <div className="z-50 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900/95 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            {matchStartData?.yourName} vs {matchStartData?.opponent} {t('Match starting soon...')}
          </h2>
        </div>
      )}
      </div>
      </div>
    </div>
  )
}

const Spinner = () => (
  <div className="loader border-t-white border-2 border-solid rounded-full w-4 h-4 animate-spin"></div>
);

const style = document.createElement('style');
style.innerHTML = `
  .loader {
    border-top-color: transparent;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .animate-spin {
    animation: spin 0.8s linear infinite;
  }
`;
document.head.appendChild(style);