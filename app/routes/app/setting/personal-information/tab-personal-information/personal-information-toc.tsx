import { Icon } from "@iconify/react/dist/iconify.js";
import { Box, Group, Text } from "@mantine/core";

import { cn } from "~/utils/style";

import classes from "./personal-information-toc.module.css";

const links = [
  { label: "Sinkronisasi HIS", link: "#his-syncronization", order: 1 },
  { label: "Informasi Pribadi", link: "#personal-information", order: 1 },
  { label: "Informasi Pekerjaan", link: "#work-information", order: 1 },
  { label: "Hak Akses", link: "#privileges", order: 1 },
  { label: "Kontak", link: "#contact", order: 1 },
  { label: "Alamat", link: "#address", order: 1 },
];

const active = "#personal-information";

export default function PersonalInformationToc() {
  const items = links.map((item) => (
    <Box<"a">
      component="a"
      href={item.link}
      onClick={(event) => event.preventDefault()}
      key={item.label}
      className={cn(classes.link, {
        [classes.linkActive]: active === item.link,
      })}
      style={{ paddingLeft: `calc(${item.order} * var(--mantine-spacing-md))` }}
    >
      {item.label}
    </Box>
  ));

  return (
    <div>
      <Group mb="md">
        <Icon icon="tabler:list" className="w-5 h-5" />
        <Text fw={600}>Daftar Isi</Text>
      </Group>
      {items}
    </div>
  );
}
