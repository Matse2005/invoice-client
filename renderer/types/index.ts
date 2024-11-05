export type Invoice = {
  id?: number;
  number?: number;
  date: string;
  client: Client;
  items: Item[];
  port: number;
  btw: boolean;
};

export type Client = {
  id?: number;
  name: string;
  address: [string, string, string] | [string, string] | [string] | [];
  btw: string;
};

export type Item = {
  id?: number;
  description: string;
  price: number;
  amount: number;
  btw: 0 | 6 | 12 | 21;
};
