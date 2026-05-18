# syntax=docker/dockerfile:1
FROM python:3.10-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential cmake gcc g++ ffmpeg espeak-ng git binutils

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

RUN pip install --upgrade pip
RUN pip install "setuptools<82.0.0" wheel scikit-build-core pybind11

COPY requirements.txt .

RUN pip install --no-cache-dir --no-build-isolation -r requirements.txt \
    --index-url https://download.pytorch.org/whl/cpu \
    --extra-index-url https://pypi.org/simple

RUN CMAKE_ARGS="-DGGML_OPENMP=ON -DGGML_NATIVE=OFF" pip install --no-cache-dir --force-reinstall --no-build-isolation --no-binary llama-cpp-python llama-cpp-python==0.3.16
RUN pip install huggingface_hub

ENV HF_HUB_DOWNLOAD_TIMEOUT=120
ENV HF_HUB_ETAG_TIMEOUT=120

RUN python -c "from huggingface_hub import hf_hub_download; hf_hub_download(repo_id='bartowski/SmolLM2-360M-Instruct-GGUF', filename='SmolLM2-360M-Instruct-Q4_K_M.gguf', local_dir='./models')"
RUN python -c "from huggingface_hub import snapshot_download; snapshot_download(repo_id='rupeshs/LCM-dreamshaper-v7-openvino-int8', local_dir='./models/lcm-dreamshaper-v7-openvino-int8', allow_patterns=['*.xml', '*.bin', '*.json', '*.txt'])"
RUN mkdir -p ./models
RUN <<EOF python
import urllib.request
import ssl
import time

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
url = 'https://openaipublic.azureedge.net/main/whisper/models/9ecf779972d90ba49c06d968637d720dd632c55bbf19d441fb42bf17a411e794/small.pt'

for i in range(5):
    try:
        print(f"Downloading Whisper small.pt (Attempt {i+1})...")
        req = urllib.request.urlopen(url, context=ctx, timeout=30)
        with open('./models/small.pt', 'wb') as f:
            f.write(req.read())
        print("Download successful!")
        break
    except Exception as e:
        print(f"Attempt {i+1} failed: {e}")
        time.sleep(2)
EOF

RUN rm -rf /opt/venv/lib/python3.10/site-packages/triton \
    /opt/venv/lib/python3.10/site-packages/nvidia \
    /opt/venv/lib/python3.10/site-packages/torch/test \
    /opt/venv/lib/python3.10/site-packages/transformers/tests \
    /opt/venv/lib/python3.10/site-packages/torch/include \
    /opt/venv/lib/python3.10/site-packages/openvino/libs/cmake && \
    find /opt/venv/lib/python3.10/site-packages/ -type d -name "include" -exec rm -rf {} + && \
    find /opt/venv/lib/python3.10/site-packages/ -type d -name "__pycache__" -exec rm -rf {} + && \
    find /opt/venv/lib/python3.10/site-packages/ -name "*.pyc" -delete && \
    find /opt/venv/lib/python3.10/site-packages/ -name "*.a" -delete && \
    find /opt/venv/lib/python3.10/site-packages/ -name "*.c" -delete && \
    find /opt/venv/lib/python3.10/site-packages/ -name "*.cpp" -delete && \
    rm -rf /opt/venv/lib/python3.10/site-packages/torch/lib/libtorch_cuda* /opt/venv/lib/python3.10/site-packages/torch/lib/libc10_cuda* && \
    find /opt/venv -name "*.so" -exec strip --strip-unneeded {} + 2>/dev/null || true && \
    pip uninstall -y pip setuptools wheel scikit-build-core pybind11


FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg espeak-ng && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY --from=builder /app/models /app/models
COPY . .

COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.7.0 /lambda-adapter /opt/extensions/lambda-adapter

ENV HOME="/tmp"
ENV XDG_CACHE_HOME="/tmp/.cache"
ENV HF_HOME="/tmp/huggingface"
ENV TRANSFORMERS_CACHE="/tmp/huggingface"
ENV TORCH_HOME="/tmp/torch"
ENV NUMBA_CACHE_DIR="/tmp/numba"
ENV MPLCONFIGDIR="/tmp/matplotlib" 

ENV OV_MODEL_CACHE_DIR=""

ENV NUMBA_NUM_THREADS="1"
ENV OMP_NUM_THREADS="1"
ENV MKL_NUM_THREADS="1"
ENV OPENBLAS_NUM_THREADS="1"
ENV VECLIB_MAXIMUM_THREADS="1"
ENV NUMEXPR_NUM_THREADS="1"
ENV HWLOC_HIDE_ERRORS="1"

ENV PORT=8080
ENV AWS_LWA_READINESS_TIMEOUT="180"
EXPOSE 8080

CMD ["gunicorn", "--workers=1", "--timeout=300", "--bind=0.0.0.0:8080", "--worker-tmp-dir", "/tmp", "--log-level=debug", "run:app"]
