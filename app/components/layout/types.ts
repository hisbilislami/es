export type AppModuleMenu = {
  icon: string;
  label: string;
  submodules: AppSubmoduleMenu[];
};

export type AppSubmoduleMenu = {
  label: string;
  path: string;
  icon: string;
  pages: AppPageMenu[];
};

export type AppPageMenu = {
  label: string;
  path: string;
  icon: string;
};
