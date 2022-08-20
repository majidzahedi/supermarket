import React from "react";
import { PrismaClient } from "@prisma/client";
import flatten from "just-flatten-it";
const prisma = new PrismaClient();

export default function Home({ title, baths, guests, description }) {
  return (
    <div>
      <h3>title: {title}</h3>
      <p>description: {description}</p>
      <p>baths: {baths}</p>
      <p>guests:{guests}</p>
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
  const channel = await prisma.home.findUnique({
    where: {
      id: params.id,
    },
    select: {
      title: true,
      baths: true,
      guests: true,
      description: true,
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
