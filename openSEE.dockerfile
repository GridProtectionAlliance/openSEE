# Use the official .NET 9.0 runtime as the base image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
ARG CONFIGURATION="Development"

# Set the working directory inside the container
WORKDIR /openSEE

# Copy openSEE from the local published folder to the container
COPY ./[Bb]uild/${CONFIGURATION}/Applications/openSEE/net9.0/publish/linux-x64/ /openSEE/

# Set permissions for all copied folders and files
RUN chmod -R 777 /openSEE

# Ensure the application is executable
RUN chmod +x /openSEE/OpenSEE

# Expose the webserver port
EXPOSE 8080

# Define the entry point to run
ENTRYPOINT ["sh", "-c", "exec /openSEE/OpenSEE"]
