import React from 'react';
import {SafeAreaView} from 'react-native';
import TodoList from './src/components/TodoList';

const App: React.FC = () => {
  return (
    <SafeAreaView style={{flex: 1}}>
      <TodoList />
    </SafeAreaView>
  );
};

export default App;
