import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as galleryApi from "../utils/galleryApi";

const GALLERY_CACHE_KEY = ["gallery"];

export const useUploadGalleryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: galleryApi.uploadGalleryItem,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: GALLERY_CACHE_KEY });
    },
  });
};

export const useUpdateGalleryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }) =>
      galleryApi.updateGalleryItem(id, payload),
    onMutate: async ({ id, ...payload }) => {
      await queryClient.cancelQueries({ queryKey: GALLERY_CACHE_KEY });

      const previousQueries = [];
      queryClient
        .getQueriesData({ queryKey: GALLERY_CACHE_KEY })
        .forEach(([key, data]) => {
          previousQueries.push({ key, data });
          if (data?.data) {
            queryClient.setQueryData(key, {
              ...data,
              data: data.data.map((item) =>
                item._id === id ? { ...item, ...payload } : item,
              ),
            });
          }
        });

      return { previousQueries };
    },
    onError: (err, variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(({ key, data }) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: GALLERY_CACHE_KEY });
    },
  });
};

export const useDeleteGalleryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => galleryApi.deleteGalleryItem(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: GALLERY_CACHE_KEY });

      const previousQueries = [];
      queryClient
        .getQueriesData({ queryKey: GALLERY_CACHE_KEY })
        .forEach(([key, data]) => {
          previousQueries.push({ key, data });
          if (data?.data) {
            queryClient.setQueryData(key, {
              ...data,
              data: data.data.filter((item) => item._id !== id),
            });
          }
        });

      return { previousQueries };
    },
    onError: (err, id, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(({ key, data }) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: GALLERY_CACHE_KEY });
    },
  });
};
