import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const LatestOrder = () => {
  return (
    <Card className="rounded-2xl shadow-sm h-full">
      
      {/* CARD HEADER */}
      <CardHeader className="px-6 py-4 border-b">
        <CardTitle className="text-lg font-semibold">
          Recent Orders
        </CardTitle>
      </CardHeader>

      {/* CARD CONTENT */}
      <CardContent className="p-8">
        {/* SCROLL WRAPPER */}
        <div className="max-h-80 overflow-y-auto">
          <Table>
            {/* STICKY HEADER */}
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Payment ID</TableHead>
                <TableHead>Total Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {Array.from({ length: 20 }).map((_, i) => (
                <TableRow key={i} className="hover:bg-muted/50">
                  <TableCell>{`INV0B${i + 1}`}</TableCell>
                  <TableCell>{`PAY${i + 1}`}</TableCell>
                  <TableCell>3</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      Pending
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ₹100
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export default LatestOrder
