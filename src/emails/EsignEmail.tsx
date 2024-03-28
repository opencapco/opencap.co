import { constants } from "../lib/constants";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "jsx-email";
import * as React from "react";

interface EsignEmailProps {
  signingLink: string;
}

export const EsignEmail = ({ signingLink }: EsignEmailProps) => (
  <Html>
    <Head />
    <Preview>Your Esign link</Preview>
    <Tailwind>
      <Body className="mx-auto my-auto bg-white font-sans">
        <Container className="mx-auto my-[40px] w-[465px] border-separate rounded border border-solid border-neutral-200 p-[20px]">
          <Heading className="mx-0 my-[30px] p-0  text-[24px] font-normal text-black">
            Your Esign link
          </Heading>
          <Section>
            <Section className="mb-[5px] mt-[10px] ">
              <Button
                className="rounded bg-black px-5 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={signingLink}
              >
                Sign document
              </Button>
            </Section>
          </Section>
          <Text className="!text-[14px] leading-[24px] text-black">
            or copy and paste this URL into your browser:{" "}
            <Link
              href={signingLink}
              className="break-all text-blue-600 no-underline"
            >
              {signingLink}
            </Link>
          </Text>
          <Hr className="mx-0 my-[26px] w-full border border-solid border-neutral-200" />
          <Link
            href={constants.url}
            className="text-sm !text-gray-400 no-underline"
          >
            {constants.title}
          </Link>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

EsignEmail.PreviewProps = {
  signingLink: `${constants.url}/sign/token`,
} as EsignEmailProps;

export default EsignEmail;
