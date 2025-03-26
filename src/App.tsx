import React, { useState } from 'react';
import { ThemeProvider, Button, TextInput } from '@gravity-ui/uikit';
import { Table, useTable } from '@gravity-ui/table';
import { Checkbox } from '@gravity-ui/uikit';
import { SortingState, ColumnDef } from '@gravity-ui/table/tanstack';
import { MapPin } from '@gravity-ui/icons';
import Header from './components/Header';
import { useEffect } from 'react';




// Интерфейс данных
interface Landmark {
  id: string;
  name: string;
  description: string;
  addedAt: string;
  rating: number;
  location: string;
  coordinates: { lat: number; lng: number };
  photo: string;
  isChecked: boolean;
}

// Компонент для отображения чекбокса
const CheckboxCell = ({ row, onToggleCheck }: { row: any; onToggleCheck: (id: string) => void }) => (
  <Checkbox checked={row.original.isChecked} onChange={() => onToggleCheck(row.original.id)} />
);

// Определение колонок
const columns = (toggleCheck: (id: string) => void, deleteLandmark: (id: string) => void, role: boolean): ColumnDef<Landmark>[] => [
  {
    id: 'checkbox',
    header: 'Статус',
    cell: ({ row }: any) => <CheckboxCell row={row} onToggleCheck={toggleCheck} />,
    size: 50,
  },
  { accessorKey: 'name', header: 'Название', size: 200 },
  { accessorKey: 'description', header: 'Описание', size: 300 },
  { accessorKey: 'addedAt', header: 'Дата добавления', size: 200 },
  { accessorKey: 'rating', header: 'Рейтинг', size: 100 },
  {
    id: 'photo',
    header: 'Фото',
    cell: ({ row }: any) => <img src={row.original.photo} alt={row.original.name} width={50} height={50} />,
    size: 100,
  },
  { accessorKey: 'location', header: 'Местоположение', size: 200 },
  {
    id: 'coordinates',
    header: 'Координаты',
    cell: ({ row }: any) => `${row.original.coordinates.lat}, ${row.original.coordinates.lng}`,
    size: 150,
  },
  {
    id: 'mapLink',
    header: 'Карта',
    cell: ({ row }: any) => {
      const lat = row.original.coordinates?.lat || 0;
      const lng = row.original.coordinates?.lng || 0;
  
      if (lat !== 0 && lng !== 0) {
        return (
          <a
            href={`https://maps.google.com/?q=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MapPin />
          </a>
        );
      }
      return <span>Нет данных</span>;
    },
    size: 100,
  },
  {
    id: 'delete',
    header: 'Удалить',
    // Кнопка будет отображаться только для администраторов
    cell: ({ row }: any) => (
      role ? (
        <Button onClick={() => deleteLandmark(row.original.id)}>Удалить</Button>
      ) : (
        <span></span>  // Сообщение для обычных пользователей
      )
    ),
    size: 100,
  },
];


const App = () => {
  const [data, setData] = useState<Landmark[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [newLandmark, setNewLandmark] = useState({
    name: '',
    description: '',
    rating: '',
    location: '',
    latitude: '',
    longitude: '',
    photo: '',
  });
  const [role, setRole] = useState<boolean>(false); // admin or user
  const [searchQuery, setSearchQuery] = useState('');

  // Функция загрузки данных с сервера
  useEffect(() => {
    fetch('http://localhost:8000/landmarks')
      .then((response) => response.json())
      .then((data) => {
        console.log(data); // координаты есть и они корректные
        setData(data);
      })
      .catch((error) => console.error('Ошибка загрузки данных:', error));
  }, []);

  // удаление 
  const deleteLandmark = (id: string) => {
    const token = "admin_token";  // Заголовок авторизации для администратора

    fetch(`http://localhost:8000/landmarks/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          setData((prev) => prev.filter((landmark) => landmark.id !== id));
        } else {
          console.error('Ошибка удаления достопримечательности');
        }
      })
      .catch((error) => console.error('Ошибка при удалении:', error));
  };

  // Обработчик добавления достопримечательности
  const handleAddLandmark = () => {
    if (!newLandmark.name || !newLandmark.description || !newLandmark.rating || !newLandmark.location || !newLandmark.latitude || !newLandmark.longitude || !newLandmark.photo) {
      alert('Заполните все поля!');
      return;
    }

     // Проверяем, что широта и долгота - это числа
     const normalizedInputLatitude = newLandmark.latitude.replace(",", "."); 
     const normalizedInputLongitude = newLandmark.longitude.replace(",", "."); 
     const numberLatitude = Number(normalizedInputLatitude);
     const numberLongitude= Number(normalizedInputLongitude);
     
    if (isNaN(numberLatitude) || isNaN(numberLongitude)) {
      alert('Широта и долгота должны быть числами! lat ');
      return;
    }

     // Проверка, что рейтинг от 1 до 5
      const rating = parseInt(newLandmark.rating);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        alert('Рейтинг должен быть числом от 1 до 5!');
        return;
      }
    
  

  const newEntry: Landmark = {
    id: Math.random().toString(36).substr(2, 9),
    name: newLandmark.name,
    description: newLandmark.description,
    addedAt: new Date().toISOString().split('T')[0],
    rating: Number(newLandmark.rating),
    photo: newLandmark.photo,
    location: newLandmark.location,
    coordinates: {
      lat: numberLatitude, 
      lng: numberLongitude,
    },
    isChecked: false,
  };

  // Отправляем данные на бэкенд
  fetch('http://localhost:8000/landmarks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newEntry),
  })
    .then((response) => response.json())
    .then((addedLandmark) => setData((prev) => [...prev, addedLandmark]))
    .catch((error) => console.error('Ошибка при добавлении:', error));
    console.log("Отправка данных на сервер:", newEntry);
    setNewLandmark({ name: '', description: '', rating: '', location: '', latitude: '', longitude: '', photo: '' });
  };
  

  const toggleCheck = (id: string) => {
    setData((data) =>
      data.map((rowData) =>
        rowData.id === id ? { ...rowData, isChecked: !rowData.isChecked } : rowData
      )
    );
  };

  const filteredData = React.useMemo(() => {
    return data.filter((landmark) => {
      const lowercasedQuery = searchQuery.toLowerCase();
  
      return (
        (landmark.name?.toLowerCase() || "").includes(lowercasedQuery) ||
        (landmark.description?.toLowerCase() || "").includes(lowercasedQuery) ||
        (landmark.location?.toLowerCase() || "").includes(lowercasedQuery)
      );
    });
  }, [searchQuery, data]);
  

  const sortedData = React.useMemo(() => {
    return [...filteredData].sort((a, b) => {
      if (a.isChecked !== b.isChecked) {
        return a.isChecked ? 1 : -1; // Чекнутые идут вниз
      }
      return 0;
    });
  }, [filteredData]);

  const table = useTable({
    columns: columns(toggleCheck, deleteLandmark, role),
    data: sortedData,
    enableSorting: true,
    getRowId: (item) => item.id,
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    
    <ThemeProvider theme="dark">
      <Header role={role} onRoleChange={setRole} /> 
      <main>
        <div className="App">
          {/* Поиск */}
          <div style={{ marginBottom: '20px' }}>
            <TextInput
              placeholder="Поиск по названию, описанию, местоположению"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {role && (
            <>
              <h2>Добавить достопримечательность</h2>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <TextInput
                  placeholder="Название"
                  value={newLandmark.name}
                  onChange={(e) => setNewLandmark({ ...newLandmark, name: e.target.value })}
                />
                <TextInput
                  placeholder="Описание"
                  value={newLandmark.description}
                  onChange={(e) => setNewLandmark({ ...newLandmark, description: e.target.value })}
                />
                <TextInput
                  placeholder="Рейтинг (1-5)"
                  type="number"
                  value={newLandmark.rating}
                  onChange={(e) => setNewLandmark({ ...newLandmark, rating: e.target.value })}
                />
                <TextInput
                  placeholder="Местоположение"
                  value={newLandmark.location}
                  onChange={(e) => setNewLandmark({ ...newLandmark, location: e.target.value })}
                />
                <TextInput
                  placeholder="Широта"
                  value={newLandmark.latitude}
                  onChange={(e) => setNewLandmark({ ...newLandmark, latitude: e.target.value })}
                />
                <TextInput
                  placeholder="Долгота"
                  value={newLandmark.longitude}
                  onChange={(e) => setNewLandmark({ ...newLandmark, longitude: e.target.value })}
                />
                <TextInput
                  placeholder="Ссылка на фото"
                  value={newLandmark.photo}
                  onChange={(e) => setNewLandmark({ ...newLandmark, photo: e.target.value })}
                />
                <Button onClick={handleAddLandmark}>Добавить</Button>
              </div>
            </>
          )}

          <div className="table-container">
            <Table className="g-table" table={table} />
          </div>
        </div>
      </main>
    </ThemeProvider>
  );
};

export default App;
