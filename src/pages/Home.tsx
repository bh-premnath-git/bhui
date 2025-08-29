// src/pages/HomePage.tsx
import React from "react";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { withHomeLayout } from "@/layouts/withHomeLayout";
import { HomeLayout } from "@/layouts/HomeLayout";

/**
 * Keep HomePage focused on the chat body. The layout controls where/how it renders.
 * When there are no messages, the layout shows placeholders; when messages exist,
 * this page is rendered inside the chat body area.
 */
const HomePage: React.FC = () => {
  return <ChatMessages />;
};

export default withHomeLayout(HomeLayout)(HomePage);
