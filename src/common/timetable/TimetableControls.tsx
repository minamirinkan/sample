export default function TimetableControls({
    onAddRow,
  }: {
    onAddRow: () => void;
  }) {
    return (
      <div className="text-center mt-4">
        <button
          onClick={onAddRow}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          行を追加
        </button>
      </div>
    );
  }
  