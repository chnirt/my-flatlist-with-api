import React, {useEffect, useState} from 'react';
import {
  View,
  FlatList,
  Text,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TextInput,
} from 'react-native';
import axios from 'axios';
import {debounce} from 'lodash';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

const ITEM_HEIGHT = 70; // Chiều cao cố định cho mỗi mục

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageNum, setPageNum] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Utility function for delay
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Fetch todos from API with a minimum loading time
  const fetchTodos = async (page: number, search: string = '') => {
    console.log('🚀 ~ fetchTodos ~ fetchTodos:');
    setLoading(true);
    const MIN_LOADING_TIME = 1000; // thời gian tối thiểu hiển thị loading (1 giây)

    try {
      // Fetch data and delay concurrently
      const [response] = await Promise.all([
        axios.get<Todo[]>(
          `https://jsonplaceholder.typicode.com/todos?_limit=20&_page=${page}&q=${search}`,
        ),
        delay(MIN_LOADING_TIME),
      ]);

      setHasMore(response.data.length > 0);
      setTodos(prev =>
        page === 1 ? response.data : [...prev, ...response.data],
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load and page/term change
  useEffect(() => {
    fetchTodos(pageNum, searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum, searchTerm]);

  // Load more todos with debounce
  const loadMoreTodos = debounce(() => {
    if (hasMore && !loading) {
      setPageNum(prevPage => prevPage + 1);
    }
  }, 1000);

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    setPageNum(1);
    fetchTodos(1, searchTerm);
  };

  // Handle search with debounce
  const handleSearch = debounce((text: string) => {
    setSearchTerm(text);
    setPageNum(1); // Reset page when searching
  }, 500);

  // Render item function
  const renderItem = ({item}: {item: Todo}) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>
        {item.id}. {item.title}
      </Text>
    </View>
  );

  // Define layout for FlatList optimization
  const getItemLayout = (
    data: ArrayLike<Todo> | null | undefined,
    index: number,
  ) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  });

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search todos..."
        onChangeText={handleSearch}
        clearButtonMode="always"
      />
      <FlatList
        data={todos}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()} // Đảm bảo key là duy nhất
        onEndReached={loadMoreTodos} // Gọi load more
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListFooterComponent={
          hasMore ? (
            <ActivityIndicator size="small" style={styles.loader} />
          ) : null
        }
        getItemLayout={getItemLayout} // Thêm getItemLayout
        initialNumToRender={10} // Render first 10 items
        maxToRenderPerBatch={10} // Render 10 items per batch
        windowSize={5} // Số mục bên ngoài khu vực nhìn thấy để render
        removeClippedSubviews // Tối ưu FlatList
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    marginVertical: 20,
  },
  searchInput: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    margin: 10,
    paddingHorizontal: 10,
  },
  itemContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemText: {
    fontSize: 16,
  },
});

export default TodoList;
