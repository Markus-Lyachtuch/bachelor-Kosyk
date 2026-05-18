import os
import io
import base64
import logging
import warnings
from typing import Optional

IS_LAMBDA = os.environ.get("AWS_LAMBDA_FUNCTION_NAME") is not None

if IS_LAMBDA:
    os.environ["HWLOC_HIDE_ERRORS"] = "1"
    os.environ["HWLOC_COMPONENTS"] = "-linux"

warnings.filterwarnings("ignore", category=UserWarning, module="diffusers")
warnings.filterwarnings("ignore", category=UserWarning, module="optimum")

try:
    import diffusers
    diffusers.utils.logging.set_verbosity_error()
except ImportError:
    pass

try:
    import transformers
    transformers.utils.logging.set_verbosity_error()
except ImportError:
    pass

from optimum.intel import OVStableDiffusionPipeline

_pipeline = None

def get_pipeline():
    global _pipeline
    if _pipeline is None:
        model_id = "./models/lcm-dreamshaper-v7-openvino-int8"
        
        pipeline_args = {
            "model_id": model_id,
            "compile": False,
            "device": "CPU"
        }
        
        if IS_LAMBDA:
            pipeline_args["ov_config"] = {
                "INFERENCE_NUM_THREADS": "4",
                "NUM_STREAMS": "1",
                "ENABLE_CPU_PINNING": False
            }

        _pipeline = OVStableDiffusionPipeline.from_pretrained(**pipeline_args)
        
        _pipeline.reshape(batch_size=1, height=320, width=320, num_images_per_prompt=1)
        _pipeline.compile()
        
    return _pipeline

def generate_image_base64(term: str, definition: Optional[str] = None) -> str:
    """
    Generates an image of size 300x300 based on a term and optional definition.
    Runs on CPU using OpenVINO pipeline.
    """
    prompt = f"A beautiful image, professional, 8k looking of {term}. The best of the best quality, clarity, detailed nice image that everyone loves."
    if definition:
        prompt += f", {definition}"
    
    pipeline = get_pipeline()
    
    result = pipeline(
        prompt=prompt,
        num_inference_steps=4,
        guidance_scale=1.5,
        height=320,
        width=320
    )
    
    image = result.images[0]
    
    image = image.resize((300, 300))
    
    buffered = io.BytesIO()
    image.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    
    return img_str
