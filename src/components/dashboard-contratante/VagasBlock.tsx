import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import VagaCard from "./VagaCard";

interface Vacancy {
  id: string;
  assignment: string;
  quantity: number;
  jobDate: string;
  status: string;
}

interface VagasBlockProps {
  title: string;
  icon: React.ReactNode;
  vacancies: Vacancy[];
}

const VagasBlock = ({ title, icon, vacancies }: VagasBlockProps) => (
  <Card>
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          {icon} {title}
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-primary text-xs" asChild>
          <Link to="/agenda">
            Ver todos <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      {vacancies.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Nenhuma vaga encontrada</p>
      ) : (
        vacancies.map((v) => (
          <VagaCard key={v.id} id={v.id} assignment={v.assignment} quantity={v.quantity} jobDate={v.jobDate} status={v.status} />
        ))
      )}
    </CardContent>
  </Card>
);

export default VagasBlock;
