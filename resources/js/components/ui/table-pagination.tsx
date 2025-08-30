import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationLink {
    url: string | null;
    label: string;
    active:boolean
}

interface TablePaginationProps {
    from: number;
    to: number;
    total: number;
    links: PaginationLink[];
    onPageChange: (url: string | null) => void;
}


export function TablePagination({ from, to, total, links, onPageChange }: TablePaginationProps) {
  return (
    <div className="flex items-center justify-between">
         <p className="text-sm text-gray-700">
            Showing {from} to {to} of {total} items
        </p>
        <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => onPageChange(links[0].url)}
                            className={!links[0].url ? 'pointer-events-none opacity-50' : ''}
                        />
                    </PaginationItem>
                    {links.slice(1, -1).map((link, index) => (
                        <PaginationItem key={index}>
                            <PaginationLink
                                onClick={() => onPageChange(link.url)}
                                isActive={link.active}
                                className={!link.url ? 'pointer-events-none opacity-50' : ''}
                            >
                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                            </PaginationLink>
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext
                            onClick={() => onPageChange(links[links.length - 1].url)}
                            className={!links[links.length - 1].url ? 'pointer-events-none opacity-50' : ''}
                        />
                    </PaginationItem>
                </PaginationContent>
          </Pagination>
    </div>
  )
}

export default TablePagination

