import Feed from "@/components/layout/Feed";
import Header from "@/components/layout/Header";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      <Header />
      <div className="container mx-auto flex gap-4 pt-16">
        <LeftSidebar />
        <Feed />
        <RightSidebar />
      </div>
    </div>
  );
}
