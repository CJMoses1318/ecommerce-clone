import { CartSheet } from "@/components/CartSheet";
import { Header } from "@/components/app/Header";
import { Toaster } from "sonner";
import { CartStoreProvider } from "@/lib/store/cart-store-provider";
import { ChatStoreProvider } from "@/lib/store/chat-store-provider";
import { SanityLive } from "@/sanity/lib/live";
import { ClerkProvider } from "@clerk/nextjs";
import { ChatSheet } from "@/components/app/ChatSheet";
import { AppShell } from "@/components/app/AppShell";



function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
        <CartStoreProvider>
          <ChatStoreProvider>
            <AppShell>
            <Header />
            <main>{children}</main>
            </AppShell>
            <CartSheet />
            <ChatSheet />
            <Toaster position="bottom-center" />
            <SanityLive />
          </ChatStoreProvider>
        </CartStoreProvider>
    </ClerkProvider>
  );
}

export default Layout;
