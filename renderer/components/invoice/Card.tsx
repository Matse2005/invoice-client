import { Invoice } from "../../types";
import Link from "next/link";

const InvoiceCard = ({ invoice }: { invoice: Invoice }) => {
  return (
    // <article>
    //   <p className="inline-block px-4 py-1 font-bold bg-gray-200 w-fit rounded-t-md">{invoice.number}</p>
    //   <div className="flex items-center justify-between px-4 py-3 bg-gray-200 rounded-md rounded-tl-none">
    //     <div className="">
    //       <h2 className="">{invoice.client.name}</h2>
    //       <p className="italic">{new Date(invoice.date).toLocaleDateString()}</p>
    //     </div>
    //     <div className="">
    //       <p>Test</p>
    //     </div>
    //   </div>
    // </article>
    <Link href={"/show/" + invoice.id}>
      <article className="px-4 py-3 space-y-1 transition-all duration-150 bg-gray-200 rounded-md hover:bg-gray-300">
        <h2 className="font-bold">Factuur #{invoice.number}</h2>
        <p className="text-sm">
          {new Date(invoice.date).toLocaleDateString()} - {invoice.client.name}
        </p>
      </article>
    </Link>
  );
};

export default InvoiceCard;
