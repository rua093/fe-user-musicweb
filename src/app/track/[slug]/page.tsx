import TrackDetailWrapper from '@/components/track/TrackDetailWrapper';
import Container from '@mui/material/Container';
import { sendRequest } from '@/utils/api';
import { notFound } from 'next/navigation'
import { Box } from '@mui/material';

import type { Metadata, ResolvingMetadata } from 'next'

type Props = {
    params: { slug: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
    { params, searchParams }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {

    const temp = params?.slug?.split('.html') ?? [];
    const temp1 = (temp[0]?.split('-') ?? []) as string[];
    const id = temp1[temp1.length - 1];

    const res = await sendRequest<IBackendRes<ITrackTop>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tracks/${id}`,
        method: "GET"
    })
    return {
        title: res.data?.title,
        description: res.data?.description,

        openGraph: {
            title: 'Hỏi Dân IT',
            description: 'Update Beyond Your Coding Skills',
            type: 'website',
            images: [`https://raw.githubusercontent.com/hoidanit/images-hosting/master/eric.png`],
        },

    }
}

export async function generateStaticParams() {
    return [
        { slug: "nu-hon-bisou-6507bf9cf423204f73c438cc.html" },
        { slug: "le-luu-ly-6507bf9cf423204f73c438cf.html" },
        { slug: "sau-con-mua-6507bf9cf423204f73c438d0.html" },
    ]
}


const DetailTrackPage = async (props: any) => {
    const { params } = props; //regx

    const temp = params?.slug?.split('.html') ?? [];
    const temp1 = (temp[0]?.split('-') ?? []) as string[];
    const id = temp1[temp1.length - 1];


    const res = await sendRequest<IBackendRes<ITrackTop>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tracks/${id}`,
        method: "GET",
        nextOption: {
            // cache: "no-store" 
            next: { tags: ['track-by-id'] }
        }
    })

    const res1 = await sendRequest<IBackendRes<IModelPaginate<ITrackComment>>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tracks/comments`,
        method: "POST",
        queryParams: {
            current: 1,
            pageSize: 100,
            trackId: id,
            sort: "-createdAt"
        },
        nextOption: {
            // cache: "no-store" 
            next: { tags: ['track-comment'] }
        }
    })
    // await new Promise(resolve => setTimeout(resolve, 5000))

    if (!res?.data)

        notFound()

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 25%, #334155 50%, #475569 75%, #64748B 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Milkyway background stars effect */}
            <Box sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
                    radial-gradient(2px 2px at 20px 30px, #F59E0B, transparent),
                    radial-gradient(2px 2px at 40px 70px, #8B5CF6, transparent),
                    radial-gradient(1px 1px at 90px 40px, #60A5FA, transparent),
                    radial-gradient(1px 1px at 130px 80px, #F59E0B, transparent),
                    radial-gradient(2px 2px at 160px 30px, #8B5CF6, transparent)
                `,
                backgroundRepeat: 'repeat',
                backgroundSize: '200px 100px',
                animation: 'twinkle 4s ease-in-out infinite',
                pointerEvents: 'none',
                zIndex: 0
            }} />
            
            <Container sx={{ 
                position: 'relative', 
                zIndex: 1,
                paddingTop: 4,
                paddingBottom: 4
            }}>
                <TrackDetailWrapper
                    track={res?.data ?? null}
                    comments={res1?.data?.result ?? []}
                />
            </Container>
        </Box>
    )
}

export default DetailTrackPage;