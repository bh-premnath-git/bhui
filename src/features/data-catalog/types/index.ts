export interface Owner {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar?: string;
}

export interface Link {
  url: string;
  title: string;
}

export interface AboutData {
  description?: string;
  owners?: Owner[];
  links?: Link[];
  tags?: string[];
}
