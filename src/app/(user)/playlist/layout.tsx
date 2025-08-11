'use client'

import { usePlaylistRefresh } from '@/utils/hooks/usePlaylistRefresh';
import { useForceRefresh } from '@/utils/hooks/useForceRefresh';

export default function PlaylistLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Auto refresh when playlist changes
    usePlaylistRefresh();
    useForceRefresh();

    return (
        <>
            {children}
        </>
    );
}
