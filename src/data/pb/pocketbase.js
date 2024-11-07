import PocketBase from 'pocketbase';

const url = 'https://siga-2000.pockethost.io/'
const pocketbase = new PocketBase(url);

export const usePocketBase = () => {

  const fetchData = async () => {
    try {
      const data = pocketbase.collection('posts').getFullList({
        sorted: '-created',
      });
      return data
    } catch (error) {
      console.error(error);

    }
  };

  return { fetchData };
}