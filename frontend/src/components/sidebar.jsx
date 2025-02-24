import { LayoutGrid, MessageCircleMore, Settings, Gamepad2, Trophy, PenIcon as UserPen, LockKeyhole, LogOut } from 'lucide-react'
import { NavLink } from "react-router-dom"
import { useAuthContext } from "../hooks/useAuthContext"
import { useSidebarContext } from "../hooks/useSidebar"
import SidebarList from "./sidebarList"
import '../i18n';
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import DefaultAvatar from '../assets/khr.jpg';

import useUserContext from '../hooks/useUserContext'

const navigation = [
  {
    icon: <LayoutGrid size={20} />,
    root: "Dashboard",
    link: "dashboard",
    list: []
  },
  {
    icon: <Gamepad2 size={20} />,
    root: "Game",
    link: "dashboard/game",
    list: []
  },
  {
    icon: <Trophy size={20} />,
    root: "Tournament",
    link: "dashboard/tournament/tournamentPage",
    list: []
  },
  {
    icon: <MessageCircleMore size={20} />,
    root: "Chat",
    link: "dashboard/chat",
    list: []
  },
  {
    icon: <LockKeyhole size={20} />,
    root: "Security",
    link: "dashboard/security",
    list: []
  },
  {
    icon: <UserPen size={20} />,
    root: "Edit Profile",
    link: "dashboard/edit-profil",
    list: []
  },
]

const Sidebar = () => {

  const { t } = useTranslation();
  const { logoutUsers, user, authtoken } = useAuthContext()
  const { open } = useSidebarContext()
  const { fetchUserData, loading } = useUserContext()

  useEffect(() => {  
    fetchUserData();
  }, [authtoken]);

  return (
    <aside 
      style={{ zIndex: 40 }}
      className={`
        fixed left-0 top-16 bottom-0
        flex flex-col justify-between
        transition-all duration-300 ease-in-out
        ${open ? "lg:w-[190px] max-w-[190px] w-[80px]" : "w-[80px]"}
        px-4 py-6
        border-r border-white/10
      `}
    >
      {/* Navigation Links */}
      <nav>
        <ul className="space-y-2">
          {navigation.map((item, index) => (
            <SidebarList 
              key={index} 
              link={item.link} 
              icon={item.icon} 
              item={t(item.root)} 
              list={item.list} 
            />
          ))}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        {/* Mobile Profile Link */}
        <NavLink 
          to={`/dashboard/profil/${user.username}`}
          className={({ isActive }) => `
            md:hidden flex items-center gap-3 p-2 rounded-lg
            transition-colors duration-200
            ${isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}
          `}
        >

          <img src={user && user.img ? `/api/usermanagement/${user.img}` : DefaultAvatar} className='w-6 h-6 bg-white/20 rounded-full flex-shrink-0'/>
        </NavLink>

        {/* Logout Button */}
        <button 
          onClick={logoutUsers} 
          className="w-full flex items-center gap-3 p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors duration-200"
        >
          <LogOut size={20} />
          {open && <span className="text-sm">{t('Logout')}</span>}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar

