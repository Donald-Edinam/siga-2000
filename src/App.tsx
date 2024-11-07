import { useQuery } from "@tanstack/react-query";
import HeroSection from "./components/page/HeroSection";
import PocketBase from "pocketbase";
import { ThreeDots } from "react-loader-spinner";

const url = 'https://siga-2000.pockethost.io/';
const pocketbase = new PocketBase(url);

const fetchData = async () => {
  try {
    const records = await pocketbase.collection('posts').getFullList({
      sort: '-created',
    });

    // Transform the data to include the complete image URLs
    const transformedRecords = records.map(record => ({
      ...record,
      featured_image: record.field ? 
        `${url}api/files/${record.collectionId}/${record.id}/${record.field}` 
        : null
    }));
    console.log("records", transformedRecords);
    return transformedRecords;
  
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
      <div className="h-screen grid place-items-center"> {/* Updated for better centering */}
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

  // Add a check for empty posts
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