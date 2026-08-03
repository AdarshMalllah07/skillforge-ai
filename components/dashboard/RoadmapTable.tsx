interface Roadmap {
    _id: string;
    title: string;
    description: string;
    category: string;
    level: string;
    progress: number;
    aiRoadmap: string;
}
interface Props {
    roadmaps: Roadmap[];
    loading: boolean;
    deleteRoadmap: (id: string) => void;
    editRoadmap: (roadmap: Roadmap) => void;
}

export default function RoadmapTable({
    roadmaps,
    loading,
    deleteRoadmap,
    editRoadmap,
}: Props) {
    if (loading) {
        return (
            <div className="mt-8 rounded-xl bg-white p-6 shadow">
                Loading...
            </div>
        );
    }

    return (
        <div className="mt-8 overflow-x-auto rounded-xl bg-white p-6 shadow">
            <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                    My Roadmaps
                </h2>

                <span className="text-sm text-gray-500">
                    {roadmaps.length} Roadmaps
                </span>
            </div>

            <table className="min-w-full">
                <thead>
                    <tr className="border-b text-left">
                        <th className="py-3">Title</th>
                        <th className="py-3">Category</th>
                        <th className="py-3">Level</th>
                        <th className="py-3">Progress</th>
                        <th className="py-3 text-center">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {roadmaps.length === 0 ? (
                        <tr>
                            <td
                                colSpan={5}
                                className="py-8 text-center text-gray-500"
                            >
                                No roadmaps found.
                            </td>
                        </tr>
                    ) : (
                        roadmaps.map((item) => (
                            <tr
                                key={item._id}
                                className="border-b hover:bg-gray-50"
                            >
                                <td className="py-4 font-medium">
                                    {item.title}
                                </td>

                                <td>{item.category}</td>

                                <td>{item.level}</td>

                                <td>{item.progress}%</td>

                                <td className="text-center">
                                    <div className="flex justify-center gap-2">

                                        <button
                                            onClick={() => editRoadmap(item)}
                                            className="rounded-md bg-yellow-500 px-3 py-1 text-white transition hover:bg-yellow-600"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => deleteRoadmap(item._id)}
                                            className="rounded-md bg-red-500 px-3 py-1 text-white transition hover:bg-red-600"
                                        >
                                            Delete
                                        </button>

                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}