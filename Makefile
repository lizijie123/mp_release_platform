NAME				:= $(shell basename -s . `git rev-parse --show-toplevel`)
GIT_COMMIT			=  $(shell git rev-parse HEAD | cut -c1-10)
GIT_BRANCH			=  $(shell git rev-parse --abbrev-ref HEAD)
DOCKER_BASE_NAME	:= $(NAME):alpine
DOCKER_BUILDER_NAME	:= $(NAME):builder
APP_ROOT			:= /opt/$(NAME)
CLEAN_IMAGES		:=
BUILD_TAG			:= $(tag)

# check if base images exist
ifeq ("$(shell docker images -q $(DOCKER_BASE_NAME) 2> /dev/null)","")
	BUILD_BASE_IMAGE	= docker build -t $(DOCKER_BASE_NAME) -f ./dockerfiles/base_image .
else
	CLEAN_IMAGES		:= $(CLEAN_IMAGES) $(DOCKER_BASE_NAME)
	BUILD_BASE_IMAGE	=
endif

# check if builder images exist
ifeq ("$(shell docker images -q $(DOCKER_BUILDER_NAME) 2> /dev/null)","")
	BUILD_BUILDER_IMAGE	= docker build --build-arg FROM_IMAGE="$(DOCKER_BASE_NAME)" \
 							-t $(DOCKER_BUILDER_NAME) -f ./dockerfiles/builder_image .
else
	CLEAN_IMAGES		:= $(CLEAN_IMAGES) $(DOCKER_BUILDER_NAME)
	BUILD_BUILDER_IMAGE	=
endif

CLEAN_IMAGES	:= $(shell echo $(CLEAN_IMAGES) | xargs)

ifeq ("$(CLEAN_IMAGES)","")
	CLEAN_DOCKER_IMAGES	=
else
	CLEAN_DOCKER_IMAGES	= docker rmi $(CLEAN_IMAGES)
endif

ifeq ("$(BUILD_TAG)","")
	BUILD_TAG	:= 2020
endif

.PHONY: docker base builder clean
.DEFAULT_GOAL := docker

docker: base builder; $(info ======== build $(NAME) release image:)
	docker build --build-arg RUNTIME_IMAGE="$(DOCKER_BASE_NAME)" \
				--build-arg BUILDER_IMAGE="$(DOCKER_BUILDER_NAME)" \
				--build-arg GIT_COMMIT=$(GIT_COMMIT) \
				--build-arg APP_ROOT="$(APP_ROOT)" \
				--build-arg APP_VERSION="$(NAME),$(GIT_BRANCH),$(GIT_COMMIT)" \
				-t $(NAME):$(BUILD_TAG) \
				--rm -f ./dockerfiles/release .

base: ; $(info ======== build $(NAME) runtime image:)
	@$(BUILD_BASE_IMAGE)

builder: ; $(info ======== build $(NAME) compile image:)
	@$(BUILD_BUILDER_IMAGE)

clean: ; $(info ======== clean docker images: $(CLEAN_IMAGES))
	@$(CLEAN_DOCKER_IMAGES)
