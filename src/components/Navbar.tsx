"use client";

import React from "react";
import StaggeredMenu from "./ui/StaggeredMenu";

export function Navbar() {
  const menuItems = [
    { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
    { label: 'About', ariaLabel: 'Learn about us', link: '/#about' },
    { label: 'Tracks', ariaLabel: 'View our tracks', link: '/#tracks' },
    { label: 'Timeline', ariaLabel: 'View the timeline', link: '/#timeline' },
    { label: 'Mentors', ariaLabel: 'View mentors', link: '/#mentors' },
    { label: 'Judges', ariaLabel: 'View judges', link: '/#judges' },
    { label: 'FAQ', ariaLabel: 'View FAQ', link: '/#faq' },
    { label: 'Register', ariaLabel: 'Register team', link: '/register' },
    { label: 'Login', ariaLabel: 'Login to portal', link: '/login' },
  ];

  const socialItems: { label: string; link: string }[] = [];

  return (
    <StaggeredMenu
      position="right"
      items={menuItems}
      socialItems={socialItems}
      displaySocials={false}
      displayItemNumbering={true}
      menuButtonColor="#ffffff"
      openMenuButtonColor="#ffffff"
      changeMenuColorOnOpen={true}
      colors={['#ef4444', '#f97316']}
      logoUrl="/logo.png"
      accentColor="#ef4444"
      isFixed={true}
      className="hackwave-menu"
    />
  );
}
