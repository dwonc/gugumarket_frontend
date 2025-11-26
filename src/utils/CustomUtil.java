// s3Slice.js (Redux Toolkit Slice)

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios'; // 이전에 설정했던 axios 인스턴스

// ----------------------------------------------------
// 1. 비동기 Thunk (Java의 uploadFiles 로직 대체)
// ----------------------------------------------------
/**
 * @param {Object} args
 * @param {FileList|File[]} args.files - File 객체 목록 (자바의 List<Path>와 유사)
 * @param {boolean} [args.deleteLocal=false] - 로컬 파일 삭제 플래그 (백엔드 로직에서는 파일 업로드 후 삭제를 의미)
 */
export const uploadFiles = createAsyncThunk(
  's3/uploadFiles',
  async ({ files, deleteLocal = false }, { rejectWithValue }) => {
        if (!files || files.length === 0) {
        return []; // 파일이 없으면 즉시 종료 (Java의 early return 대체)
        }

        // FormData를 사용하여 파일 전송 (실제 백엔드 API 엔드포인트)
        const formData = new FormData();
    for (const file of files) {
        formData.append('files', file); // 'files'는 서버에서 받을 필드 이름
    }

            try {
            // 서버의 파일 업로드 API 엔드포인트로 POST 요청
            const response = await api.post('/api/s3/upload', formData, {
    headers: {
        'Content-Type': 'multipart/form-data', // 파일 전송 시 필수
    },
});

        // 서버로부터 저장된 파일 경로/URL 목록을 반환한다고 가정
        return response.data.uploadedFileUrls;
    } catch (error) {
        // Java 코드의 RuntimeException 처리와 유사
        return rejectWithValue(error.response?.data || error.message);
    }
            }
            );


// ----------------------------------------------------
// 2. 비동기 Thunk (Java의 deleteFiles 로직 대체)
// ----------------------------------------------------
/**
 * @param {string[]} filePaths - 서버에 저장된 파일 경로/URL 목록
 */
export const deleteFiles = createAsyncThunk(
  's3/deleteFiles',
  async (filePaths, { rejectWithValue }) => {
        if (!filePaths || filePaths.length === 0) {
        return; // 파일이 없으면 종료
        }

        try {
        // 서버의 파일 삭제 API 엔드포인트로 DELETE 요청
        // 백엔드는 이 경로를 받아 S3Client.deleteObject를 실행합니다.
        const response = await api.delete('/api/s3/delete', {
    data: { filePaths }, // DELETE 요청에 본문(Body)으로 데이터 전송
});

        return response.data; // 성공 응답 반환
    } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
    }
            }
            );


// ----------------------------------------------------
// 3. Slice 및 Reducer 정의
// ----------------------------------------------------
            const initialState = {
uploadStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
deleteStatus: 'idle',
uploadedUrls: [],
error: null,
        };

        const s3Slice = createSlice({
    name: 's3',
            initialState,
            reducers: {
        // 동기적인 액션이 필요하다면 여기에 정의
        clearUploadStatus: (state) => {
                state.uploadStatus = 'idle';
        state.error = null;
    }
    },
    extraReducers: (builder) => {
            builder
                    // 파일 업로드 처리
                    .addCase(uploadFiles.pending, (state) => {
                    state.uploadStatus = 'loading';
      })
      .addCase(uploadFiles.fulfilled, (state, action) => {
            state.uploadStatus = 'succeeded';
    state.uploadedUrls = action.payload; // 서버가 반환한 URL 목록
    state.error = null;
      })
      .addCase(uploadFiles.rejected, (state, action) => {
            state.uploadStatus = 'failed';
    state.error = action.payload || action.error.message;
      })

    // 파일 삭제 처리
      .addCase(deleteFiles.pending, (state) => {
            state.deleteStatus = 'loading';
      })
      .addCase(deleteFiles.fulfilled, (state) => {
            state.deleteStatus = 'succeeded';
    state.error = null;
    // 필요하다면 여기에 uploadedUrls에서 삭제된 항목을 제거하는 로직 추가
      })
      .addCase(deleteFiles.rejected, (state, action) => {
            state.deleteStatus = 'failed';
    state.error = action.payload || action.error.message;
      });
  },
});

export const { clearUploadStatus } = s3Slice.actions;

export default s3Slice.reducer;