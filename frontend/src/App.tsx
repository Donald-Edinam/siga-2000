// Updated App.js for your React frontend
import HeroSection from "./components/page/HeroSection";
import { useQuery } from "@tanstack/react-query";
import { ThreeDots } from "react-loader-spinner";

// Change this to your backend URL
const API_URL = import.meta.env.VITE_PUBLIC_URL

const fetchData = async () => {
  try {
    const response = await fetch(`${API_URL}/api/posts`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    
    const records = await response.json();
    console.log("records", records);
    return records;

  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default function App() {
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchData,
  });

  if (isLoading) {
    return (
      <div className="h-screen grid place-items-center">
        <ThreeDots
          visible={true}
          height="80"
          width="80"
          color="#4fa94d"
          radius="9"
          ariaLabel="three-dots-loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen grid place-items-center">
        <div className="text-center">
          <p className="text-red-500">Error: {error.message || "Something went wrong, Please try again!"}</p>
        </div>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="h-screen grid place-items-center">
        <p>No posts found.</p>
      </div>
    );
  }

  return (
    <>
      <HeroSection posts={posts} />
    </>
  );
}