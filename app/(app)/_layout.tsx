import { useState, useEffect } from 'react';
import { supabase } from "../../lib/supabase";
import { Session } from "@supabase/supabase-js";
import { View, Text } from "react-native";
import { Redirect, Slot } from "expo-router";


export default function AppLayout() {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [session, setSession] = useState<null | Session>(null);

  useEffect(() => {
    const {data: { subscription }} = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoaded(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!isLoaded) {
    return <View>
        <Text>Loading...</Text>
    </View>;
  }

  if(!session) {
    return <Redirect href="/sign-in" />
  }

  return <Slot />;
}
