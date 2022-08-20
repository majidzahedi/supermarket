import React from "react";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import flatten from "just-flatten-it";

const prisma = new PrismaClient();
export default function Channel({ name, homes }) {
  const router = useRouter();
  const { channel } = router.query;
  return (
    <div style={{ maxWidth: "500px", margin: "10px auto", fontSize: "30px" }}>
      {name}
      {homes?.map((home) => (
        <Link key={home.id} href={`/${channel}/${home.id}`}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <h1>{home.title}</h1>
            <p>{home.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export async function getStaticPaths() {
  const channels = await prisma.channel.findMany({
    select: { name: true, homes: { select: { id: true } } },
  });

  const allPaths = flatten(
    channels.map((channel) => {
      return channel?.homes.map((home) => ({
        channel: channel.name,
        id: home.id,
      }));
    })
  );
  return {
    paths: allPaths.map(({ channel, id }) => ({
      params: {
        channel,
        id,
      },
    })),
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  const channel = await prisma.channel.findUnique({
    where: {
      name: params.channel,
    },
    select: {
      name: true,
      homes: true,
    },
  });

  if (channel) {
    return {
      props: JSON.parse(JSON.stringify(channel)),
    };
  }

  return {
    redirect: {
      destination: "/",
      permanent: false,
    },
  };
}
