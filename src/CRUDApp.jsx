import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";


const fetchPosts = async () => {
  const { data } = await axios.get("https://jsonplaceholder.typicode.com/posts");
  return data.slice(0, 5);
};

const addPost = async (newPost) => {
  return { ...newPost, id: Math.random() * 1000 };
};

const updatePost = async ({ id, title }) => {
  return { id, title };
};

const deletePost = async (id) => {
  return id;
};

export default function CRUDApp() {
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editingId, setEditingId] = useState(null);

  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  const addMutation = useMutation({
    mutationFn: addPost,
    onSuccess: (newPost) => {
      queryClient.setQueryData(["posts"], (oldPosts) => [...oldPosts, newPost]);
      setNewTitle("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updatePost,
    onSuccess: (updatedPost) => {
      queryClient.setQueryData(["posts"], (oldPosts) =>
        oldPosts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
      );
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: (id) => {
      queryClient.setQueryData(["posts"], (oldPosts) =>
        oldPosts.filter((post) => post.id !== id)
      );
    },
  });

  if (isLoading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error fetching posts!</p>;

  return (
    <div className="max-w-3xl mx-auto p-8 bg-gradient-to-br from-pink-400 to-purple-500 shadow-lg rounded-lg text-white mt-10">
      <h2 className="text-3xl font-bold text-center mb-6 animate-pulse">Colorful CRUD with TanStack Query 🌟</h2>

      {/* Add New Post */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Enter new title"
          className="w-full p-3 border rounded-md text-gray-800 focus:outline-none focus:ring-4 focus:ring-yellow-300"
        />
        <button
          onClick={() => addMutation.mutate({ title: newTitle })}
          className="bg-yellow-400 text-gray-900 px-5 py-3 rounded-md font-bold hover:bg-yellow-500 transition transform hover:scale-110"
        >
          Add
        </button>
      </div>

      {/* Posts List */}
      <ul className="space-y-4">
        {posts.map((post) => (
          <li
            key={post.id}
            className="flex items-center justify-between bg-white text-gray-900 p-4 rounded-md shadow-md transform transition hover:scale-105 hover:shadow-xl"
          >
            {editingId === post.id ? (
              <div className="flex gap-2 w-full">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-4 focus:ring-green-400"
                />
                <button
                  onClick={() => updateMutation.mutate({ id: post.id, title: editTitle })}
                  className="bg-green-400 text-gray-900 px-4 py-2 rounded-md font-bold hover:bg-green-500 transition transform hover:scale-110"
                >
                  Save
                </button>
              </div>
            ) : (
              <>
                <span className="text-lg font-semibold">{post.title}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(post.id);
                      setEditTitle(post.title);
                    }}
                    className="bg-blue-400 text-white px-4 py-2 rounded-md font-bold hover:bg-blue-500 transition transform hover:scale-110"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(post.id)}
                    className="bg-red-400 text-white px-4 py-2 rounded-md font-bold hover:bg-red-500 transition transform hover:scale-110"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
