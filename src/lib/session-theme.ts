import type { Session } from "@/types/reservation";

export interface SessionTheme {
  header: string;
  iconWrap: string;
  titleText: string;
  subtitleText: string;
  badge: string;
  columnHead: string;
}

export const SESSION_THEME: Record<Session, SessionTheme> = {
  LUNCH: {
    header: "bg-session-lunch border-border",
    iconWrap: "bg-session-lunch-accent/20 text-session-lunch-foreground",
    titleText: "text-session-lunch-foreground",
    subtitleText: "text-session-lunch-foreground/65",
    badge:
      "border-session-lunch-accent/25 bg-background/50 text-session-lunch-foreground",
    columnHead:
      "bg-session-lunch-columns text-session-lunch-columns-foreground border-border",
  },
  WAITING: {
    header: "bg-session-waiting border-border",
    iconWrap: "bg-session-waiting-accent/20 text-session-waiting-foreground",
    titleText: "text-session-waiting-foreground",
    subtitleText: "text-session-waiting-foreground/65",
    badge:
      "border-session-waiting-accent/25 bg-background/50 text-session-waiting-foreground",
    columnHead:
      "bg-session-waiting-columns text-session-waiting-columns-foreground border-border",
  },
  DINNER: {
    header: "bg-session-dinner border-border",
    iconWrap: "bg-session-dinner-accent/15 text-session-dinner-foreground",
    titleText: "text-session-dinner-foreground",
    subtitleText: "text-session-dinner-foreground/65",
    badge:
      "border-session-dinner-accent/25 bg-background/50 text-session-dinner-foreground",
    columnHead:
      "bg-session-dinner-columns text-session-dinner-columns-foreground border-border",
  },
};
