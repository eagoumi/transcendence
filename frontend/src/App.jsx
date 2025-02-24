import ProtectRouter from "./providers/ProtectRouter"
import ProtectAuthRouter from "./providers/ProtectAuthRouter"
import Authentication from "./pages/authentication.jsx";
import Dashboard from './pages/dashboard';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TwoFactorAuth from './pages/OTP_2fa/TwoFactorAuth.jsx'
import HomePage from './HomePage';
import SecurityPage from './pages/SecurityProfile.jsx';
import Pve3d from './pages/pve/Pve3d';
import Pvp2d from './pages/pvp/Pvp2d';
import Pve2d from './pages/pve/Pve2d';
import Tictactoe from "./pages/tictactoe/Tictactoe.jsx";
import Local2d from "./pages/local/Local2d";
import Profile from './pages/Profile.jsx'
import Profil from './pages/Profil.jsx'
import Tournament from './pages/tournament/Tournament'
import TournamentHome from './pages/tournament/tournamentHome';
import LocalTournament from './pages/tournament/LocalTournament';
import TournamentPage from './pages/tournament/tournamentPage.jsx';
import Chat from "./pages/chat.jsx";
import Game from "./pages/game.jsx";
import Settings from "./pages/settings.jsx";
import { ColorProvider } from "./context/ColorContext.jsx";

import VerifyPsdEmail from "./pages/VerifyPsdEmail.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import ResetEmailSend from "./pages/ResetEmailSend.jsx"
import SearchPage from "./pages/SearchPage.jsx";

import Layout from './components/layout';

import Providers from './providers/providers.jsx';
import NotFound from "./pages/404.jsx";
import LoadingApi from "./components/auth/LoadingApi.jsx"


import "./App.css"

function App() {
  return (
    <Router>
      <Providers>

            <Routes>
              <Route element={<ProtectAuthRouter />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Authentication />} />
                <Route path="/verify-email" element={<VerifyPsdEmail />} />
                <Route path="/email-check" element={<ResetEmailSend />} />
                <Route path="password-reset/confirm" element={<ResetPassword />} />
                <Route path="/google-callback" element={<LoadingApi />} />
                <Route path="/42intra-callback" element={<LoadingApi />} />
              </Route>


              <Route element={<ProtectRouter />}>
                <Route element={<Layout/>}>
                  <Route path='/dashboard'>
                    <Route index element={<Dashboard />} />
                    
                    <Route path="chat" element={<Chat />} />

                    <Route path="game">
                      <Route index element={<Game />} />
                      <Route path="pvp2d" element={<ColorProvider><Pvp2d /></ColorProvider>} />
                      <Route path="pve2d" element={<ColorProvider><Pve2d /></ColorProvider>} />
                      <Route path="tictactoe" element={<Tictactoe />} />
                      <Route path="local2d" element={ <ColorProvider><Local2d /></ColorProvider> } />
                    </Route>
                    
                    <Route path="profil/:username" element={<Profil />} />
                    
                    <Route path='tournament'>
                      <Route path='tournamentPage' element={<TournamentPage/>}/>
                      <Route index element={<TournamentHome/>}/>
                      <Route path='live' element={<Tournament/>}/>
                      <Route path='local' element={<LocalTournament/>}/>
                    </Route>

                    <Route path="security" element={<SecurityPage />} />
                    <Route path="edit-profil" element={<Profile />} />
                    <Route path="SearchPage" element={<SearchPage />} />

                  </Route>
                  
                  <Route path="/TwoFactorAuth" element={<TwoFactorAuth />} />
                  
                  
                </Route>
              </Route>

              <Route path="*" element={<NotFound/>} />

            </Routes>

        </Providers>
    </Router>
  );
}

export default App;