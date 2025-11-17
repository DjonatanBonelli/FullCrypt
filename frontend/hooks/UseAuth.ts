"use client";

import { useContext } from "react";
import { useAuth as internal } from "@/providers/AuthProvider";

export const useAuth = () => internal();    